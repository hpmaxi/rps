// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import {UltraVerifier as RevealVerifier} from './circuits/rps_reveal_play/contract/rps_reveal_play/plonk_vk.sol';
import {UltraVerifier as ValidVerifier} from './circuits/rps_valid_play/contract/rps_valid_play/plonk_vk.sol';

contract RPS {
    event GameStarted(uint256 indexed idGame, address player, uint256 position);
    event GamePending(uint256 indexed idGame, address player, uint256 position);
    event Tie(uint256 indexed idGame);
    event PlayerWon(uint256 indexed idGame, address player);

    enum Status {
        NotStarted,
        Started,
        Pending,
        Settled
    }

    enum Play {
        NONE,
        ROCK,
        PAPER,
        SCISSORS
    }

    struct Hand {
        address player;
        string proof;
        Play play;
    }

    struct Game {
        Status status;
        Hand player0;
        Hand player1;
        address winner;
    }

    enum Outcome {
        NONE,
        PLAYER0_WINS,
        PLAYER1_WINS,
        TIE
    }

    mapping(uint256 => Game) public games;
    mapping(Play => mapping(Play => Outcome)) private outcomeTable;

    uint256 public idGame;

    RevealVerifier public revealVerifier;
    ValidVerifier public validVerifier;

    constructor(address _validPlayVerifier, address _revealPlayVerifier) {
        validVerifier = ValidVerifier(_validPlayVerifier);
        revealVerifier = RevealVerifier(_revealPlayVerifier);

        outcomeTable[Play.ROCK][Play.SCISSORS] = Outcome.PLAYER0_WINS;
        outcomeTable[Play.ROCK][Play.PAPER] = Outcome.PLAYER1_WINS;
        outcomeTable[Play.SCISSORS][Play.PAPER] = Outcome.PLAYER0_WINS;
        outcomeTable[Play.SCISSORS][Play.ROCK] = Outcome.PLAYER1_WINS;
        outcomeTable[Play.PAPER][Play.ROCK] = Outcome.PLAYER0_WINS;
        outcomeTable[Play.PAPER][Play.SCISSORS] = Outcome.PLAYER1_WINS;
        outcomeTable[Play.ROCK][Play.ROCK] = Outcome.TIE;
        outcomeTable[Play.SCISSORS][Play.SCISSORS] = Outcome.TIE;
        outcomeTable[Play.PAPER][Play.PAPER] = Outcome.TIE;
    }

    function secretPlay(uint256 _idGame, string calldata proof) public {
        Game storage game = games[_idGame];

        require(game.status != Status.Settled, 'Match already finished');
        require(game.status != Status.Pending, 'Reveal play');

        // Call verify to check if is a valid play

        if (game.status == Status.NotStarted) {
            game.player0 = Hand({player: msg.sender, proof: proof, play: Play.NONE});
            game.status = Status.Started;

            emit GameStarted(_idGame, msg.sender, 0);
        } else if (game.status == Status.Started) {
            game.player1 = Hand({player: msg.sender, proof: proof, play: Play.NONE});

            game.status = Status.Pending;
            emit GamePending(_idGame, msg.sender, 1);
        }
    }

    function determineWinner(Play play0, Play play1) private view returns (uint256) {
        Outcome outcome = outcomeTable[play0][play1];

        if (outcome == Outcome.PLAYER0_WINS) {
            return 0;
        } else if (outcome == Outcome.PLAYER1_WINS) {
            return 1;
        } else {
            return 2; // Tie
        }
    }

    function revealPlay(uint256 _idGame, uint256 position, Play _play) public {
        Game storage game = games[_idGame];
        require(
            game.status != Status.Pending,
            'Both players must submit their proofs before the revealing'
        );

        Hand storage hand;
        if (position == 0) {
            hand = game.player0;
        } else {
            hand = game.player1;
        }
        require(hand.player == msg.sender, 'Invalid position or player');

        // TODO Verify pub hand.proof pub nonce+ secret play => else revert
        hand.play = _play;

        Play play0 = game.player0.play;
        Play play1 = game.player1.play;

        if (play0 != Play.NONE && play1 != Play.NONE) {
            // Game finished, check winner
            uint256 winner = determineWinner(play0, play1);

            if (winner != 2) {
                if (winner == 0) {
                    games[_idGame].winner = games[_idGame].player0.player;
                } else {
                    games[_idGame].winner = games[_idGame].player1.player;
                }
                emit PlayerWon(_idGame, games[_idGame].winner);
            } else {
                emit Tie(_idGame);
            }

            games[_idGame].status = Status.Settled;

            // TODO Improve make it easier to play and avoid stale states
            idGame++;
        }
    }
}
