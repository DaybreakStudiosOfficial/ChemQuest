const tiles = {
    collision: [
        16, 17, 28, 29, 18, 19, 20, 21, 22, 23, 30, 31, 24, 25, 26, 27, 32, 33, // edges
        34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45 // walls
    ],
    exclusion: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 // floors
    ],
    door: [0, 1, 2, 3, 4, 5, 8, 9, 10, 11],
    floor: {
        center: [
            { index: [0, 1, 2, 3], weight: 20 },
            { index: 4, weight: 1 },
            { index: 5, weight: 1 }
        ],
        top: [6, 7],
        left: [8, 9],
        right: [10, 11],
        corner: {
            left: 12,
            right: 13
        },
        turn: {
            left: 14,
            right: 15
        }
    },
    edge: {
        top: [16, 17],
        bottom: [28, 29],
        left: [18, 19],
        right: [20, 21],
        corner: {
            topLeft: 22,
            topRight: 23,
            bottomLeft: 30,
            bottomRight: 31
        },
        end: {
            left: 24,
            right: 25
        },
        turn: {
            topLeft: 26,
            topRight: 27,
            bottomLeft: 33,
            bottomRight: 32
        }
    },
    wall: {
        brick: [
            [34, 35, 36],
            [37, 38, 39]
        ],
        end: {
            left: [40, 41, 42],
            right: [43, 44, 45]
        }
    }
}

export default tiles