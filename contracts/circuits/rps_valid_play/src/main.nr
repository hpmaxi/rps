use dep::std;

mod HandType {
    global ROCK: Field = 0;
    global PAPER: Field = 1;
    global SCISSORS: Field = 2;
}

fn main(hand: Field, salt: Field) -> pub Field {
    let mut validGame = 0;
    if ((hand == HandType::ROCK) | (hand == HandType::PAPER) | (hand == HandType::SCISSORS)) {
        validGame = 1;
    }
    assert(validGame == 1);

    let hashedValue = std::hash::pedersen_hash([hand, salt]);
    hashedValue
}
