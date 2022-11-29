// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
* Author: alxi <chitch@alxi.nl> (https://twitter.com/0xalxi)
* Modified By: dannithomx.eth
* EIP-5050 Token Interaction Standard: [tbd]
*
* Implementation of an interactive token protocol.

*/

interface IActionsNFTState {
    enum TokenSlapState {
        DEFAULT,
        SLAPPED,
        WINNER,
        DEAD
    }
    enum TokenCastState {
        CHILL,
        LUST,
        RAGE,
        IMMUNE
    }

    struct TokenStats {
        uint256 strength;
        TokenSlapState state;
        TokenCastState vibes;
    }
    struct Property {
        uint256 actionId;
        string color;
    }
    struct ActionProperty {
        Property slappedLoogie;
        Property lustLoogie;
        Property rageLoogie;
        Property deadLoogie;
        Property immuneLoogie;
    }

    function registerToken(address _contract, uint256 tokenId) external;

    function getTokenStats(address _contract, uint256 tokenId)
        external
        view
        returns (TokenStats memory);

    function getStrength(address _contract, uint256 tokenId)
        external
        view
        returns (uint256);

    function getState(address _contract, uint256 tokenId)
        external
        view
        returns (TokenSlapState);

    function getActionStateURI(uint256 tokenId)
        external
        view
        returns (string memory);

    function healAfterExpiry(address _contract, uint256 _tokenId) external;
}
