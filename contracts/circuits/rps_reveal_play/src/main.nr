use dep::std;

fn main(hand: Field, salt: Field, hash: pub Field) {
    let hashedValue = std::hash::pedersen_hash([hand, salt]);
    assert(hashedValue == hash);
}
