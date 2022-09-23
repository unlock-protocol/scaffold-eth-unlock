// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interface/IPublicLockV10.sol";
/**
 * @title MembersHub
 * @dev Broadcast memberships via tags
 * @author Danni Thomx
 */

 // Todo
 // Make adding tag payable and charge small fee
 // Make MembersHub upgradable(Still contemplating)
 // Add withdrawal (if adding tags is now payable)
 // [Contemplating - needs research] Make tags NFTs 

contract MembersHub is Ownable {
    string[] public tags;

    event NewTag(string tag, address indexed creator);
    event BroadcastMembership(address indexed membershipAddress, address creator, string[] relatedTags);
    event RemoveTag(address creator, string tag);

    struct Membership {
        address membershipAddress;
        address creator;
        string[] relatedTags;
    }
    
    uint256 public maxTagsPerMembershp = 5;
    mapping(address => Membership) membershipsData;
    mapping(address => bool) allBroadcasts;
    mapping(address => mapping(string => bool)) public tagsByUser;
    
    constructor() { }

    // /**
    //  * @dev check if tag already exists 
    //  * @param string to check
    //  */
    function doesTagExist( string memory _stringToSearch) public view returns(bool){
       string[] memory arr = tags;
       for(uint256 i =0; i < arr.length; i++){
           if(keccak256(abi.encodePacked(arr[i])) == keccak256(abi.encodePacked(_stringToSearch))){
               return true;
           }
       }
        return false;
    }

    // /**
    //  * @dev add new tag 
    //  * @param string to add
    //  */
    function addTag(string memory _newTag) public returns(string[] memory tag) {
        require(keccak256(abi.encodePacked(_newTag)) != keccak256(abi.encodePacked("")), "Invalid tag");
        require(doesTagExist(_newTag) == false, "tag exists" );
        tags.push(_newTag);
        tagsByUser[msg.sender][_newTag] = true;
        emit NewTag(_newTag, msg.sender);
        return tags;
    }

    // /**
    //  * @dev remove tag 
    //  * @param string to remove
    //  */
    function removeTag(string memory _tag) public {
       uint256 tagToRemoveIndex;
       require(doesTagExist(_tag) == true, "Nonexistent tag" );
       require(tagsByUser[msg.sender][_tag] == true, "Not creator");
       for(uint256 i =0; i < tags.length; i++){
           if(keccak256(abi.encodePacked(tags[i])) == keccak256(abi.encodePacked(_tag))){
               tagToRemoveIndex = i;
               tags[tagToRemoveIndex] = tags[tags.length - 1];
               tags.pop();
               tagsByUser[msg.sender][_tag] = false;
               emit RemoveTag(msg.sender, _tag);
           }
       }
    }

    // /**
    //  * @dev get all tags 
    //  */
    function getTags() public view returns (string[] memory){
        return tags;
    }

    // @dev set membershipData
    function _setMembershipData(address _membershipAddr, string[] memory _relatedTags) private {
        membershipsData[_membershipAddr] = Membership(_membershipAddr, msg.sender, _relatedTags);
    }

    // @dev set max tags per membership
    function setMaxTagsPerMembership(uint256 _maxTags) public onlyOwner {
        require(_maxTags > 0, "Less than 1");
        maxTagsPerMembershp = _maxTags;
    }

    function _isLockManager (IPublicLock _publicLock) private view returns(bool) {
        IPublicLock pubLock = _publicLock;
        bool isManager = pubLock.isLockManager(msg.sender);
        return isManager;
    }

    // /**
    //  * @dev broadcast membership 
    //  * @param list of related tags
    //  * @param membership lock address
    //  */
    function broadcastMembership(
        string[] calldata _relTags,
        IPublicLock _publicLock
    ) external returns (string[] memory) {
        uint256 tagsCount = _relTags.length;
        address _membershipAddress = address(_publicLock);
        require(tagsCount <= maxTagsPerMembershp, "Too many tags"); //check related tags are not more than max tags per membership
        require(_relTags.length >= 1, "Empty tags");// check that related tags is not empty
        require(_isLockManager(_publicLock), "Not Manager");// check that caller is a lock manager
        require(allBroadcasts[_membershipAddress] == false, "Membership exist");// check that membership is not already broadcasted
        for(uint i = 0; i < _relTags.length; i++) {
            require(doesTagExist(_relTags[i]) == true, "Nonexistent Tag");// check that related tags are in the tags array
        }
        Membership memory s; //New membership struct
        s.membershipAddress = _membershipAddress;
        s.creator = msg.sender;
        s.relatedTags = _relTags;
        membershipsData[_membershipAddress] = s;
        allBroadcasts[_membershipAddress] = true;
        emit BroadcastMembership(_membershipAddress, msg.sender, _relTags);
        return _relTags;
    }

    function getBroadcastData(address _membershipAddr)external view returns (Membership memory) {
        Membership memory membership = membershipsData[_membershipAddr];
        return membership;
    }
 
    // function broadcastMembership(
    //     string[] calldata _relTags,
    //     address _membershipAdr
    // ) external returns (string[] memory) {
    //     require(allBroadcasts[_membershipAdr] == false, "Membership exist");
    //     for(uint i = 0; i < _relTags.length; i++) {
    //         require(doesTagExist(_relTags[i]) == true, "Nonexistent Tag");
    //     }
    //     Membership memory s;
    //     s.membershipAddress = _membershipAdr;
    //     s.creator = msg.sender;
    //     s.relatedTags = _relTags;
    //     membershipsData[_membershipAdr] = s;
    //     allBroadcasts[_membershipAdr] = true;
    //     emit BroadcastMembership(_membershipAdr, msg.sender, _relTags);
    //     return _relTags;
    // }
}