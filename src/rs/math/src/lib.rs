use oob::oob;

oob::runtime!();

#[oob]
fn sum(a: i32, b: i32) -> i32 {
    a.wrapping_add(b)
}

#[oob]
pub struct Block {
    pub x: i32,
    pub y: u8,
    pub z: i32,
}

#[oob]
fn top_blockss(block: Block) -> Block {
    return Block {
        x: block.x,
        y: block.y + 1,
        z: block.z,
    };
}
