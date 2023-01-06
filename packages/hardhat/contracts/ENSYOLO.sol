//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./interfaces/ENS.sol";
import "./interfaces/IPublicLockV10.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ENSBaseRegistrarImplementation {
  function safeTransferFrom(address from, address recepient, uint256 tokenId)virtual external;
  function isApprovedForAll(address owner, address operator)virtual external view returns(bool);
  function ownerOf(uint256 tokenId)virtual external view returns(address);
}

contract ENSYOLO is ReentrancyGuard, Ownable {
  address ENSRegistry  = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
  address ENSBaseRegistrarAddress = 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  ENS public ENSContract;
  ENSBaseRegistrarImplementation public ENSBaseRegistrar;

  address payable public constant buidlguidl = payable(0x97843608a00e2bbc75ab0C1911387E002565DEDE); // buidlguidl.eth

  uint256 public price = 0.01 ether;

  uint256 public donations = 0;

  event ENSYoloClaimed(uint256 indexed id, address recepient, bytes32 nameHash, uint256 value);
  event ENSYolo(uint256 indexed id, address donor, bytes32 indexed nameHash);
  event ENSYoloCancelled(bytes32 indexed nameHash);

  struct EYOLO {
    uint id;
    bytes32 nameHash;
    address controller;
    uint256 value;
    bool claimed;
    address lock;
  }

  mapping(bytes32 => EYOLO) gifted;
  // mapping(address => EYOLO[]) all
  
  constructor() { 
    _tokenIds.increment();
    ENSContract = ENS(ENSRegistry);
    ENSBaseRegistrar = ENSBaseRegistrarImplementation(ENSBaseRegistrarAddress);
  }

  modifier isAuthorised(uint _tokenId) {
    address _owner = ENSBaseRegistrar.ownerOf(_tokenId);
    require(ENSContract.isApprovedForAll(_owner, address(this)), "ENSYOLO: Not approved - ENSRegistry");
    require(ENSBaseRegistrar.isApprovedForAll(_owner, address(this)), "ENSYOLO: Not approved - BaseRegistrarImplementation");
    _;
  }

  function getGifted(bytes32 _nameHash)public view returns(EYOLO memory _gifted) {
    _gifted = gifted[_nameHash];
  }

  function isGifted(bytes32 _nameHash)public view returns(bool){
    bool _isGifted; 
    if (gifted[_nameHash].id > 0) _isGifted = true;
    return _isGifted;
  }

  // Checks if ENSYOLO contract is approved for transactions 
  // on _owner's behalf in ENSRegistry smart contract
  function isApprovedForAllENSRegistry(address _owner)public view returns (bool) {
    return ENSContract.isApprovedForAll(_owner, address(this));
  }

 // Checks if ENSYOLO contract is approved for transactions 
 // on _owner's behalf in BaseRegistrarImplementation smart contract
  function isApprovedForAllBaseRegistrar(address _owner)public view returns (bool) {
    return ENSBaseRegistrar.isApprovedForAll(_owner, address(this));
  }

  // checks if the provided hash is a valid ENS record
  function isENS(bytes32 _nameHash) public view returns(bool){
    return ENSContract.recordExists(_nameHash);
  }

  // checks if the provided address has valid keys to the specified lock
  function hasClaimKey(IPublicLock _claimLock, address _recepient)public view returns(bool){
    return IPublicLock(_claimLock).getHasValidKey(_recepient);
  }

  function giftENS(
    bytes32 _nameHash, 
    uint _tokenId,
    address _lockAddress
  )
    public
    payable 
    isAuthorised(_tokenId)
    returns (uint256)
  {
      require(msg.value >= price, "NOT ENOUGH");
      require(isENS(_nameHash), "Non existent node");
      require(ENSContract.owner(_nameHash) == msg.sender || ENSBaseRegistrar.ownerOf(_tokenId) == msg.sender, "Not owner");
      require(IPublicLock(payable(_lockAddress)).isLockManager(msg.sender), "Not Manager");
      require(gifted[_nameHash].claimed == true || gifted[_nameHash].id == 0, "Active ENS YOLO" );

      uint id = _tokenIds.current();
      _tokenIds.increment();
      EYOLO memory ensYolo = EYOLO(id,_nameHash, msg.sender, msg.value, false, _lockAddress);
      gifted[_nameHash] = ensYolo;
      emit ENSYolo(id, msg.sender, _nameHash);
      return ensYolo.id;
  }

  function _transferENS(bytes32 _nameHash, address _recepient, uint _tokenId)private {
    address _owner = ENSBaseRegistrar.ownerOf(_tokenId);
    ENSContract.setOwner(_nameHash, _recepient);
    ENSBaseRegistrar.safeTransferFrom(_owner,_recepient,_tokenId);
  }

  function cancelENSYolo(bytes32 _nameHash)public payable nonReentrant {
    require(gifted[_nameHash].id > 0, "Not gifted");
    require(gifted[_nameHash].controller == msg.sender, "Caller not controller");
    require(gifted[_nameHash].claimed == false, "Already claimed");
    (bool s,) = payable(msg.sender).call{value: gifted[_nameHash].value}("");
    require(s, "Failed to send ETH");
    delete gifted[_nameHash];
    emit ENSYoloCancelled(_nameHash);
  }
  
  function claimItem(bytes32 _nameHash, uint _tokenId)
    public
    payable 
    isAuthorised(_tokenId)
    nonReentrant
    returns (bool)
  {
    address _recepient = msg.sender;
    require(gifted[_nameHash].id > 0, "Not gifted");
    require(hasClaimKey(IPublicLock(payable(gifted[_nameHash].lock)), msg.sender), "No valid claim key");
    require(gifted[_nameHash].claimed == false, "Already claimed");
    require(gifted[_nameHash].controller != msg.sender, "Self claim");
    uint _amount = gifted[_nameHash].value;
    EYOLO memory ensYolo = gifted[_nameHash]; 
    ensYolo.controller = msg.sender;
    ensYolo.claimed = true;
    ensYolo.value = 0;
    gifted[_nameHash] = ensYolo;
    _transferENS(_nameHash, _recepient, _tokenId);
    (bool yolo,) = payable(msg.sender).call{ value: _amount }("");
    require(yolo, "Failed to YOLO ETH");

    emit ENSYoloClaimed(gifted[_nameHash].id, msg.sender, gifted[_nameHash].nameHash, gifted[_nameHash].value);
    return gifted[_nameHash].claimed;
  }

  receive() payable external {
    uint amount = msg.value;
    donations += amount;
  }

  function withdraw() public onlyOwner {
    require(donations > 0, "Zero balance");
    (bool success,) = buidlguidl.call{value: donations}("");
    require(success, "Failed to withdraw ");
    donations = 0;
  }
}