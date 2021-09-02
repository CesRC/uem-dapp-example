pragma solidity 0.5.16;

contract PictureLikeSystem {
    // Struct that represents a Picture
    struct Picture {
        uint256 id;
        string name;
        uint256 likeCount;
    }

    // Mapping for users that have voted
    mapping(address => bool) public users;
    // Mapping fot pictures

    mapping(uint256 => Picture) public pictures;

    // Store pictures Count
    uint256 public picturesCount = 2;
    // Event to notify of user voting

    event likedEvent(uint256 indexed _pictureId);

    // Constructor to create two pictures in its deployment
    constructor() public {
        pictures[1] = Picture(1, "Picture 1", 0);
        pictures[2] = Picture(2, "Picture 2", 0);
    }

    // Like function
    function like(uint256 _pictureId) public {
        // require that users haven't voted before
        require(!users[msg.sender]);
        // likers only can vote once
        users[msg.sender] = true;
        // update picture like Count
        pictures[_pictureId].likeCount++;
        // trigger liked event
        emit likedEvent(_pictureId);
    }
}
