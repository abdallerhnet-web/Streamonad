// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// forge install OpenZeppelin/openzeppelin-contracts --no-commit
// remappings.txt: @openzeppelin/=lib/openzeppelin-contracts/
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Per-agent token. Full supply minted to the creator.
contract AgentToken is ERC20 {
    constructor(string memory n, string memory s, address to, uint256 supply) ERC20(n, s) {
        _mint(to, supply);
    }
}

/// @notice Registry + token factory + tipping in one contract (one tx = agent + token).
contract StreamonadRegistry {
    struct Agent {
        address creator;
        address token;
        uint64 createdAt;
        uint256 totalTips; // native MON, wei
        string name;
        string tagline;
        string personality; // system prompt
        string avatarURI;
    }

    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 ether;

    Agent[] private _agents; // id = index
    mapping(address => uint256[]) private _byCreator;

    event AgentCreated(uint256 indexed id, address indexed creator, address token, string name);
    event Tipped(uint256 indexed id, address indexed from, uint256 amount, string message);

    error EmptyField();
    error NoValue();
    error TransferFailed();
    error BadId();

    function createAgent(
        string calldata name,
        string calldata symbol,
        string calldata tagline,
        string calldata personality,
        string calldata avatarURI
    ) external returns (uint256 id, address token) {
        if (bytes(name).length == 0 || bytes(symbol).length == 0 || bytes(personality).length == 0) {
            revert EmptyField();
        }

        token = address(new AgentToken(name, symbol, msg.sender, INITIAL_SUPPLY));
        id = _agents.length;

        _agents.push(
            Agent({
                creator: msg.sender,
                token: token,
                createdAt: uint64(block.timestamp),
                totalTips: 0,
                name: name,
                tagline: tagline,
                personality: personality,
                avatarURI: avatarURI
            })
        );
        _byCreator[msg.sender].push(id);

        emit AgentCreated(id, msg.sender, token, name);
    }

    /// @notice Tip native MON straight to the agent's creator.
    function tip(uint256 id, string calldata message) external payable {
        if (id >= _agents.length) revert BadId();
        if (msg.value == 0) revert NoValue();

        Agent storage a = _agents[id];
        a.totalTips += msg.value; // effects before interaction

        (bool ok,) = a.creator.call{value: msg.value}("");
        if (!ok) revert TransferFailed();

        emit Tipped(id, msg.sender, msg.value, message);
    }

    // ---------- views ----------

    function agentCount() external view returns (uint256) {
        return _agents.length;
    }

    function getAgent(uint256 id) external view returns (Agent memory) {
        if (id >= _agents.length) revert BadId();
        return _agents[id];
    }

    function getAgentsByCreator(address creator) external view returns (uint256[] memory) {
        return _byCreator[creator];
    }

    /// @notice Paginated list for the public page.
    function getAgents(uint256 start, uint256 limit) external view returns (Agent[] memory out) {
        uint256 n = _agents.length;
        if (start >= n) return new Agent[](0);
        uint256 end = start + limit > n ? n : start + limit;
        out = new Agent[](end - start);
        for (uint256 i = start; i < end; i++) {
            out[i - start] = _agents[i];
        }
    }
}
