//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/ISimpleBridge.sol";
import "./interfaces/ENS.sol";
import "./interfaces/IPublicLockV10.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IConnext} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnext.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

abstract contract ENSBaseRegistrarImplementation {
    function safeTransferFrom(
        address from,
        address recepient,
        uint256 tokenId
    ) external virtual;

    function isApprovedForAll(
        address owner,
        address operator
    ) external view virtual returns (bool);

    function ownerOf(uint256 tokenId) external view virtual returns (address);
}

interface IWETH {
    function deposit() external payable;

    function approve(address guy, uint256 wad) external returns (bool);
}

contract ENSYOLO is ISimpleBridge, ReentrancyGuard, Ownable {
    // address WETH = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 // Goerli
    // address ENSRegistry  = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e; //goerli
    // address ENSBaseRegistrarAddress = 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85; //goerli
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    ENS public ENSContract;
    ENSBaseRegistrarImplementation public ENSBaseRegistrar;
    IConnext public connext;
    IPublicLock public membershipLock;
    address payable public constant buidlguidl =
        payable(0x97843608a00e2bbc75ab0C1911387E002565DEDE); // buidlguidl.eth
    uint256 public price = 0.01 ether;
    uint256 public donations = 0;

    event ENSYoloClaimed(
        uint256 indexed id,
        address recepient,
        bytes32 nameHash,
        uint256 value
    );
    event ENSYolo(uint256 indexed id, address donor, bytes32 indexed nameHash);
    event ENSYoloCancelled(bytes32 indexed nameHash);
    event QuestCreated(
        bytes32 indexed ensNameHash,
        address indexed lock,
        address indexed nftContract,
        address creator,
        uint256 claimExpiration
    );
    event QuestCompleted(
        bytes32 indexed ensNameHash,
        address indexed lock,
        address indexed nftContract,
        address winner
    );
    event QuestCancelled(
        bytes32 indexed ensNameHash,
        address indexed lock,
        address indexed creator
    );

    struct EYOLO {
        uint id;
        bytes32 nameHash;
        address controller;
        uint256 value;
        bool claimed;
        address lock;
    }

    struct Quest {
        bytes32 ensNameHash;
        bytes description;
        address creator;
        address lock;
        address nftContract;
        address winner;
        bool isCompleted;
        bool isActive;
        uint256 claimExpiration;
    }

    mapping(bytes32 => EYOLO) gifted;
    mapping(bytes32 => Quest) public quests;
    Quest[] allQuests;

    constructor(
        ENS _ENSRegistryAddress,
        ENSBaseRegistrarImplementation _ENSBaseRegistrarAddress,
        address _connext,
        address payable _membership
    ) {
        _tokenIds.increment();
        ENSContract = _ENSRegistryAddress;
        ENSBaseRegistrar = _ENSBaseRegistrarAddress;
        connext = IConnext(_connext);
        membershipLock = IPublicLock(_membership);
    }

    /**
     * @dev Modifier ensures ENSYOLO contract is approved for transactions for the specified ENS name on the ENSRegisty and ENSBaseRegistrar contracts by the caller`.
     * @dev Throws if not approved by caller on either contract
     * @param _tokenId specifies the ENS name to be queried.
     */
    // modifier isAuthorised(uint _tokenId) {
    //     address _owner = ENSBaseRegistrar.ownerOf(_tokenId);
    //     require(
    //         ENSContract.isApprovedForAll(_owner, address(this)),
    //         "ENSYOLO: Not approved - ENSRegistry"
    //     );
    //     require(
    //         ENSBaseRegistrar.isApprovedForAll(_owner, address(this)),
    //         "ENSYOLO: Not approved - BaseRegistrarImplementation"
    //     );
    //     _;
    // }

    /**
     * @dev Modifier ensures caller (except owner) has a valid membership on the membership lock smart contract.
     * @dev Throws if not caller does not have a valid membership on `membershipLock`
     */
    modifier onlyMember() {
        if (msg.sender != owner()) {
            require(
                membershipLock.getHasValidKey(msg.sender) == true,
                "members only"
            );
        }
        _;
    }

    function getGifted(
        bytes32 _nameHash
    ) public view returns (EYOLO memory _gifted) {
        _gifted = gifted[_nameHash];
    }

    function isGifted(bytes32 _nameHash) public view returns (bool) {
        bool _isGifted;
        if (gifted[_nameHash].id > 0) _isGifted = true;
        return _isGifted;
    }

    function getAllQuests()view external returns(Quest[] memory _allQuests){
        _allQuests = allQuests;
    }

    /**
     * @dev Checks if ENSYOLO contract is approved for transactions on _owner's behalf on the ENSRegistry smart contract
     * @param _owner The owner of the ENS name to be queried.
     */
    function isApprovedForAllENSRegistry(
        address _owner
    ) public view returns (bool) {
        return ENSContract.isApprovedForAll(_owner, address(this));
    }

    /**
     * @dev Checks if ENSYOLO contract is approved for transactions on _owner's behalf on the ENSRegistry smart contract
     * @param _owner The owner of the ENS name to be queried.
     */
    function isApprovedForAllBaseRegistrar(
        address _owner
    ) public view returns (bool) {
        return ENSBaseRegistrar.isApprovedForAll(_owner, address(this));
    }

    /**
     * @dev Checks if the provided hash is a valid ENS record
     * @param _nameHash ENS name hash
     */
    function isENS(bytes32 _nameHash) public view returns (bool) {
        return ENSContract.recordExists(_nameHash);
    }

    /**
     * @dev Checks if the provided address has valid keys to the specified lock
     * @param _claimLock Lock address for EYOLO to be claimed
     * @param _recepient Address being checked for a KEY to the lock
     */
    function hasClaimKey(
        IPublicLock _claimLock,
        address _recepient
    ) public view returns (bool) {
        return IPublicLock(_claimLock).getHasValidKey(_recepient);
    }

    function giftENS(
        bytes32 _nameHash,
        uint _tokenId,
        address _lockAddress
    // ) public payable isAuthorised(_tokenId) returns (uint256) {
    ) public payable returns (uint256) {
        require(msg.value >= price, "NOT ENOUGH");
        // require(isENS(_nameHash), "Non existent ENS node");
        // require(
        //     ENSContract.owner(_nameHash) == msg.sender,
        //     "ENSRegistry: Not owner"
        // );
        // require(
        //     ENSBaseRegistrar.ownerOf(_tokenId) == msg.sender,
        //     "BaseRegistrarImplementation: Not owner"
        // );
        require(
            IPublicLock(payable(_lockAddress)).isLockManager(msg.sender),
            "Not lock Manager"
        );
        require(
            gifted[_nameHash].claimed == true || gifted[_nameHash].id == 0,
            "Active ENS YOLO"
        );

        uint id = _tokenIds.current();
        _tokenIds.increment();
        EYOLO memory ensYolo = EYOLO(
            id,
            _nameHash,
            msg.sender,
            msg.value,
            false,
            _lockAddress
        );
        gifted[_nameHash] = ensYolo;
        emit ENSYolo(id, msg.sender, _nameHash);
        return ensYolo.id;
    }

    function _transferENS(
        bytes32 _nameHash,
        address _recepient,
        uint _tokenId
    ) private {
        address _owner = ENSBaseRegistrar.ownerOf(_tokenId);
        ENSContract.setOwner(_nameHash, _recepient);
        ENSBaseRegistrar.safeTransferFrom(_owner, _recepient, _tokenId);
    }

    function _updateQuest(bytes32 _ensNameHash, Quest memory _quest) internal {
        for(uint256 i = 0; i < allQuests.length; i++){
            if(allQuests[i].ensNameHash == _ensNameHash) {
                allQuests[i] = _quest;
            }
        }
    }

    function cancelENSYolo(bytes32 _nameHash) public payable nonReentrant {
        require(gifted[_nameHash].id > 0, "Not gifted");
        require(!quests[_nameHash].isActive, "Active quest");
        require(
            gifted[_nameHash].controller == msg.sender,
            "Caller not controller"
        );
        require(gifted[_nameHash].claimed == false, "Already claimed");
        // check that quest is not completed 
        require(!quests[_nameHash].isCompleted, "Quest Completed");
        Quest memory quest = quests[_nameHash];
        quest.isActive = false;
        // update quests mapping with quest
        quests[_nameHash] = quest;
        // update all quests array
        _updateQuest(_nameHash, quest);
        (bool s, ) = payable(msg.sender).call{value: gifted[_nameHash].value}("");
        require(s, "Failed to send ETH");
        delete gifted[_nameHash];
        emit ENSYoloCancelled(_nameHash);
    }

    function claimItem(
        bytes32 _nameHash,
        uint _tokenId
    // ) public payable isAuthorised(_tokenId) nonReentrant returns (bool) {
    ) public payable nonReentrant returns (bool) {
        address _recepient = msg.sender;
        require(gifted[_nameHash].id > 0, "Not gifted");
        require(
            hasClaimKey(
                IPublicLock(payable(gifted[_nameHash].lock)),
                msg.sender
            ),
            "No valid claim key"
        );
        require(gifted[_nameHash].claimed == false, "Already claimed");
        require(gifted[_nameHash].controller != msg.sender, "Self claim");
        uint _amount = gifted[_nameHash].value;
        EYOLO memory ensYolo = gifted[_nameHash];
        ensYolo.controller = msg.sender;
        ensYolo.claimed = true;
        ensYolo.value = 0;
        gifted[_nameHash] = ensYolo;
        _transferENS(_nameHash, _recepient, _tokenId);
        (bool yolo, ) = payable(msg.sender).call{value: _amount}("");
        require(yolo, "Failed to YOLO ETH");
        emit ENSYoloClaimed(
            gifted[_nameHash].id,
            msg.sender,
            gifted[_nameHash].nameHash,
            gifted[_nameHash].value
        );
        return gifted[_nameHash].claimed;
    }

    function createQuest(bytes32 _ensNameHash, bytes memory _description, address _nftContract, uint256 _claimExpiration) external {
        address _lockAddress = gifted[_ensNameHash].lock;
        // check that ens is gifted
        require(gifted[_ensNameHash].id > 0,"Not gifted");
        // check that msg.sender is gift creator
        require(gifted[_ensNameHash].controller == msg.sender, "Not controller");
        // check that msg.sender is lock manager
        require(
            IPublicLock(payable(_lockAddress)).isLockManager(msg.sender),
            "Caller Not Manager"
        ); 
        // check that ens yolo is lock manager
        require(
            IPublicLock(payable(_lockAddress)).isLockManager(address(this)),
            "ENS YOLO Not Manager"
        );
        // check that quest is not active
        require(!quests[_ensNameHash].isActive, "Active quest");
        // check that quest is not completed
        require(!quests[_ensNameHash].isCompleted, "Completed quest");

        // update quest mapping
        Quest memory quest = Quest(
            _ensNameHash,
            _description,
            msg.sender,
            _lockAddress,
            _nftContract,
            address(0),
            false,
            true,
            _claimExpiration
        );
        quests[_ensNameHash] = quest;
        allQuests.push(quest);

        // emit quest created event
        emit QuestCreated(_ensNameHash, _lockAddress, _nftContract, msg.sender, _claimExpiration);
    }

    function completeQuest(bytes32 _ensNameHash) nonReentrant external {
        // check that quest is active
        require(quests[_ensNameHash].isActive, "Not active quest");
        // check that quest is not completed
        require(!quests[_ensNameHash].isCompleted, "Completed quest");
        // check that msg.sender is not creator
        require(quests[_ensNameHash].creator != msg.sender, "Quest Creator not allowed");
        // check that ens yolo is not claimed
        require(gifted[_ensNameHash].claimed == false, "Already claimed");
        // check that user has nft from nftContract
        require(IERC721(quests[_ensNameHash].nftContract).balanceOf(msg.sender) > 0, "Caller doesn't have the required NFT");

        Quest memory quest = quests[_ensNameHash];
        // update completed status of quest
        quest.isCompleted = true;
        // update active status of quest
        quest.isActive = false;
        // update winner of quest
        quest.winner = msg.sender;
        // update quests mapping with quest
        quests[_ensNameHash] = quest;
        // update all quests array
        _updateQuest(_ensNameHash, quest);
        // grant key to winner 
        address[] memory _recepients;
        uint256[] memory _exp;
        address[] memory _managers;
        _managers[0] = address(this);
        _exp[0] = quest.claimExpiration;
        _recepients[0] = quest.winner;
        IPublicLock(payable(quest.lock)).grantKeys(_recepients, _exp,_managers);
        // emit quest complete event
        emit QuestCompleted(quest.ensNameHash, quest.lock, quest.nftContract, quest.winner);
    }

    function cancelQuest(bytes32 _ensNameHash) external{
        // check that quest is active
        require(quests[_ensNameHash].isActive, "Not active quest");
        // check that yolo is not claimed
        require(gifted[_ensNameHash].claimed == false, "Already claimed");
        // check that quest is not completed 
        require(!quests[_ensNameHash].isCompleted, "Quest Completed");
        // check that caller is creator
        require(quests[_ensNameHash].creator == msg.sender, "Not Creator");

        Quest memory quest = quests[_ensNameHash];
        // update quest active status
        quest.isActive = false;
        // update quests mapping with quest
        quests[_ensNameHash] = quest;
        // update all quests array
        _updateQuest(_ensNameHash, quest);
        // emit quest cancelled event
        emit QuestCancelled(_ensNameHash, quest.lock, quest.creator);
    }

    /**
     * @notice Transfers ERC20 tokens from one chain to another.
     * @param token Address of the token on this domain.
     * @param amount The amount to transfer.
     * @param recipient The destination address (e.g. a wallet).
     * @param destinationDomain The destination domain ID.
     * @param slippage The maximum amount of slippage the user will accept in BPS(0 - 10000 eg 30 equals 0.3% slippage).
     * @param relayerFee The fee offered to relayers.
     */
    function xTransfer(
        address token,
        uint256 amount,
        address recipient,
        uint32 destinationDomain,
        uint256 slippage,
        uint256 relayerFee
    ) external payable onlyMember {
        _xTransfer(
            token,
            amount,
            recipient,
            destinationDomain,
            slippage,
            relayerFee
        );
    }

    /**
     * @notice Transfers ETH from one chain to another.
     * @param destinationUnwrapper Address of Connext WETH unwrapper on the destination chain.
     * @param weth Address of WETH on origin chain.
     * @param amount The amount to transfer.
     * @param recipient The destination address (e.g. a wallet).
     * @param destinationDomain The destination domain ID.
     * @param slippage The maximum amount of slippage the user will accept in BPS(0 - 10000 eg 30 equals 0.3% slippage).
     * @param relayerFee The fee offered to relayers.
     */
    function xTransferEth(
        address destinationUnwrapper,
        address weth,
        uint256 amount,
        address recipient,
        uint32 destinationDomain,
        uint256 slippage,
        uint256 relayerFee
    ) external payable onlyMember {
        _xTransferEth(
            destinationUnwrapper,
            weth,
            amount,
            recipient,
            destinationDomain,
            slippage,
            relayerFee
        );
    }

    function _xTransfer(
        address token,
        uint256 amount,
        address recipient,
        uint32 destinationDomain,
        uint256 slippage,
        uint256 relayerFee
    ) internal {
        IERC20 _token = IERC20(token);

        require(
            _token.allowance(msg.sender, address(this)) >= amount,
            "User must approve amount"
        );

        // User sends funds to this contract
        _token.transferFrom(msg.sender, address(this), amount);

        // This contract approves transfer to Connext
        _token.approve(address(connext), amount);

        connext.xcall{value: relayerFee}(
            destinationDomain, // _destination: Domain ID of the destination chain
            recipient, // _to: address receiving the funds on the destination
            token, // _asset: address of the token contract
            msg.sender, // _delegate: address that can revert or forceLocal on destination
            amount, // _amount: amount of tokens to transfer
            slippage, // _slippage: the maximum amount of slippage the user will accept in BPS (e.g. 30 = 0.3%)
            bytes("") // _callData: empty bytes because we're only sending funds
        );
    }

    function _xTransferEth(
        address destinationUnwrapper,
        address weth,
        uint256 amount,
        address recipient,
        uint32 destinationDomain,
        uint256 slippage,
        uint256 relayerFee
    ) internal {
        // Wrap ETH into WETH to send with the xcall
        IWETH(weth).deposit{value: amount}();

        // This contract approves transfer to Connext
        IWETH(weth).approve(address(connext), amount);

        // Encode the recipient address for calldata
        bytes memory callData = abi.encode(recipient);

        // xcall the Unwrapper contract to unwrap WETH into ETH on destination
        connext.xcall{value: relayerFee}(
            destinationDomain, // _destination: Domain ID of the destination chain
            destinationUnwrapper, // _to: Unwrapper contract
            weth, // _asset: address of the WETH contract
            msg.sender, // _delegate: address that can revert or forceLocal on destination
            amount, // _amount: amount of tokens to transfer
            slippage, // _slippage: the maximum amount of slippage the user will accept in BPS (e.g. 30 = 0.3%)
            callData // _callData: calldata with encoded recipient address
        );
    }

    receive() external payable {
        uint amount = msg.value;
        donations += amount;
    }

    function withdraw() public onlyOwner {
        require(donations > 0, "Zero balance");
        (bool success, ) = buidlguidl.call{value: donations}("");
        require(success, "Failed to withdraw ");
        donations = 0;
    }
}
