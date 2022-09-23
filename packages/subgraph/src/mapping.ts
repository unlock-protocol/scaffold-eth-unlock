import { BigInt, Address } from "@graphprotocol/graph-ts"

import {
  BroadcastMembership,
  NewTag
} from "../generated/MembersHub/MembersHub"

import { Tag, TagCreator,Membership,Broadcaster } from "../generated/schema"

export function handleNewTag(event: NewTag): void {
  
  //  tag creator
  let tagCreatorId = event.params.creator.toHex()
  let tagCreator = TagCreator.load(tagCreatorId)
  if (tagCreator == null) {
    tagCreator = new TagCreator(tagCreatorId)
    tagCreator.tagsCount = BigInt.fromI32(1)
  } else {
    tagCreator.tagsCount = tagCreator.tagsCount.plus(BigInt.fromI32(1))
  }
  tagCreator.address = event.params.creator
  tagCreator.save()
  
  // tags
  let tagId = event.params.tag
  let tag = Tag.load(tagId)
  if (tag == null) {
    tag = new Tag(tagId)
  }
  tag.name = event.params.tag
  tag.creator = tagCreatorId
  tag.createdAt = event.block.timestamp
  tag.transactionHash = event.transaction.hash.toString()
  tag.save()
}

export function handleBroadcastMembership(event: BroadcastMembership): void {
  
  // Broadcaster
  let broadcasterId = event.params.creator.toHex()
  let broadcaster = Broadcaster.load(broadcasterId)
  if (broadcaster == null) {
    broadcaster = new Broadcaster(broadcasterId)
    broadcaster.membershipsCount = BigInt.fromI32(1);
  } else {
    broadcaster.membershipsCount = broadcaster.membershipsCount.plus(BigInt.fromI32(1))
  }
  broadcaster.address = event.params.creator
  broadcaster.save()
    
  //membership
  let membership = new Membership(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  membership.membershipAddress = event.params.membershipAddress;
  membership.creator = broadcasterId;
  membership.createdAt = event.block.timestamp;
  membership.transactionHash = event.transaction.hash.toHex();
  membership.relatedTags = event.params.relatedTags.map<string>(
    (item) => item.toString()
  )
  membership.save();
}