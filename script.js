const startBtn = document.getElementById('start-btn')
const canvas  = document.getElementById('canvas')
const startScreen  = document.querySelector('.start-screen')
const checkpointScreen   = document.querySelector('.checkpoint-screen')
const checkpointMessage = document.querySelector('.checkpoint-screen > p')

// sets up ability to add 2d graphics
// Canvas API is used to create graphics using JS and HTML canvas element
// getContext method provides context for where graphics will be rendered.
const ctx = canvas.getContext("2d")

// canvas element has a width property
// innerWidth property is a # that represents the interior width of the browser window.
canvas.width = innerWidth;

// innerHeight property represents the interior height
canvas.height = innerHeight

// applies gravity to player
const gravity = 0.5

// track checkpoint collision detection
let isCheckpointCollisionDetectionActive = true;

// size of elements reponsive and adapts to screen sizes
const proportionalSize = (size) => {
    return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size ;

}

// define characteristics for main player
class Player{
    constructor() {
        this.position = {
            x: proportionalSize(10),
            y: proportionalSize(400),
        };
        this.velocity = {
            x:0,
            y:0,
        };
        this.width = proportionalSize(40);
        this.height = proportionalSize(40);
    }

    // responsible for creating players width, height, position & fill color
    draw() {
        // set color for player
        ctx.fillStyle ='#99c9ff';
        
        // create players shape
        ctx.fillRect(this.position.x,this.position.y,this.width,this.height);
    }

    // updates player's position & velocity as it moves
    update() {
        // ensures player is continually draw as game updates
        this.draw();

        // adjust velocity when player moves right
        this.position.x += this.velocity.x;

        // adjust velocity when player jumps up
        this.position.y += this.velocity.y;

        // keeps player from jumping past height of canva's
        if(this.position.y + this.height + this.velocity.y <= canvas.height ){
            
            if(this.position.y < 0){
                this.position.y = 0;
                this.velocity.y = gravity
            }

            this.velocity.y += gravity

        } else {
            this.velocity.y = 0
        }

        // ensures player stays within boundaries & not to far left
        if(this.position.x < this.width){
            this.position.x = this.width
        }

        // check if player's X exceeds right edge of canvas, if so keep it from that
        if(this.position.x >= canvas.width - 2 * this.width){
            // ensures players X never exceed right edge
            this.position.x = canvas.width - 2 * this.width
        }

    }
}

// platforms and platform logic
class Platform {
    constructor(x,y) {

        this.position = {
            x,
            y,
        };

        this.width = 200;

        // makes height proportional to screen size
        this.height = proportionalSize(40);

    }

    draw(){
        ctx.fillStyle = "#acd157";
        ctx.fillRect(this.position.x,this.position.y,this.width,this.height)
    }
}

// logic for the checkpoints
class CheckPoint {
    constructor(x,y,z) {
        this.position = {
            x,
            y,
        }
        this.width = proportionalSize(40);
        
        this.height = proportionalSize(70);

        // used to check player reached checkpoint
        this.claimed = false;
    };

    draw() {
        ctx.fillStyle = "#f1be32";
        ctx.fillRect(this.position.x,this.position.y,this.width,this.height)
    }

    claim() {
        this.height = 0
        this.width = 0
        this.position.y = Infinity
        this.claimed = true
    }

}

// creates new instance of Player
const player = new Player()

// list of position for platforms
const platformPositions = [
    {x:500 , y:proportionalSize(450)},
    {x:700 , y:proportionalSize(400)},
    {x:850 , y:proportionalSize(350)},
    {x:900 , y:proportionalSize(350)},
    {x:1050 , y:proportionalSize(150)},
    {x:2500 , y:proportionalSize(450)},
    {x:2900 , y:proportionalSize(400)},
    {x:3150 , y:proportionalSize(350)},
    {x:3900 , y:proportionalSize(450)},
    {x:4200 , y:proportionalSize(400)},
    {x:4400 , y:proportionalSize(200)},
    {x:4700 , y:proportionalSize(150)},
];

// create list of platform instances
// list used to draw platforms on canvas
const platforms = platformPositions.map(
    // implicitly return the creation of a new
    platform => new Platform(platform.x , platform.y)
);

const checkpointPositions = [
    {x: 1170, y: proportionalSize(80), z: 1},
    {x: 2900, y: proportionalSize(330), z: 2 },
    {x: 4800, y: proportionalSize(80), z: 3 }
]

// list of new checkpoints
const checkpoints = checkpointPositions.map(
    // implicitly return the creation of a new
    checkpoint => new CheckPoint(checkpoint.x,checkpoint.y,checkpoint.z)
)

// functionality for moving player across screen
const animate = () => {
    // requestAnimationFrame() is a web API,
    // takes in a callback and updates animation on screen.
    requestAnimationFrame(animate)

    // clears canavs before rendering next animation frame
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // draws platforms onto canvas
    platforms.forEach(platform => {
        platform.draw()
    });

    // draws checkpoints onto canvas
    checkpoints.forEach(checkpoint => {
        checkpoint.draw()
    })

    // updates players position as it moves
    player.update()

    // logic for increasing or decreasing player's velocity,
    // based on left or right movement
    if(keys.rightKey.pressed && player.position.x < proportionalSize(400)){
        player.velocity.x = 5
    } else if (keys.leftKey.pressed && player.position.x > proportionalSize(100)) {
        player.velocity.x = -5
    } else {
        player.velocity.x = 0
    }

    // updates the platform's x positin as player moves across screen
    if(keys.rightKey.pressed && isCheckpointCollisionDetectionActive){
        platforms.forEach(platform =>{
            platform.position.x -= 5
        });

        checkpoints.forEach(checkpoint => {
            checkpoint.position.x -= 5
        })

    } else if(keys.leftKey.pressed && isCheckpointCollisionDetectionActive){
        platforms.forEach(platform =>{
            platform.position.x += 5
        });

        checkpoints.forEach(checkpoint => {
            checkpoint.position.x += 5
        })

    }

    // collision detection logic
    platforms.forEach(platform => {

        const collisionDetectionRules = [
            player.position.y + player.height <= platform.position.y,
            player.position.y + player.height + player.velocity.y >= platform.position.y, 
            player.position.x >= platform.position.x - player.width / 2,
            player.position.x <= platform.position.x + platform.width - player.width / 3,
        ]

        // checks if every rule is truthy
        if(collisionDetectionRules.every(rule => rule)){
            player.velocity.y = 0
            return
        };

        const platformDetectionRules = [
            player.position.x >= platform.position.x - player.width / 2,
            player.position.x <= platform.position.x + platform.width - player.width / 3,
            player.position.y + player.height >= platform.position.y,
            player.position.y <= platform.position.y + platform.height,
        ];

        if(platformDetectionRules.every(rule=>rule)){
            player.position.y =platform.position.y + player.height;
            player.velocity.y = gravity
        }

    });

    // when player reached checkpoint screen is displayed
    checkpoints.forEach((checkpoint,index, checkpoints) => {
        const checkpointDetectionRules = [
            player.position.x >= checkpoint.position.x,
            player.position.y >= checkpoint.position.y,
            player.position.y + player.height <= checkpoint.position.y + checkpoint.height,
            isCheckpointCollisionDetectionActive,
            player.position.x - player.width <= checkpoint.position.x - checkpoint.width + player.width * 0.9,
            index === 0 || checkpoints[index - 1].claimed === true
        ];

        if(checkpointDetectionRules.every(rule => rule)){
            checkpoint.claim()

            // condition checks if player reached last checkpoint
            if(index === checkpoints.length - 1){
                isCheckpointCollisionDetectionActive = false;
                showCheckpointScreen("You reached the final checkpoint!")
                movePlayer("ArrowRight", 0, false)
            } else if(player.position.x >= checkpoint.position.x && player.position.x <= checkpoint.position.x + 40){
                showCheckpointScreen("You reached a checkpoint!")
            }

        };

    });


}

// manage players movements
const keys = {
    rightKey: {pressed: false},
    leftKey: {pressed: false},
};

// functionality responsible for moving player
const movePlayer = (key, xVelocity, isPressed) => {
    if(!isCheckpointCollisionDetectionActive){
        player.velocity.x = 0;
        player.velocity.y = 0
        return
    }
    switch (key) {
        case "ArrowLeft":
            keys.leftKey.pressed = isPressed;
            if (xVelocity === 0) {
                player.velocity.x =  xVelocity;
            }
            player.velocity.x -= xVelocity
            break;

        case "ArrowUp":
        case " ":
        case "Spacebar":
            player.velocity.y -= 8;
            break;
        
        case "ArrowRight":
            keys.rightKey.pressed = isPressed
            if(xVelocity === 0){
                player.velocity.x = xVelocity
            }
            player.velocity.x += xVelocity
        //     break;
        // default:
        //     break;
    }
}

const startGame = () => {
    //displays canvas elements & hides the startScreen container
    canvas.style.display = "block"
    startScreen.style.display = "none"

    // moves player acroos screen
    animate()

}

// message shown when player reaches checkpoint
const showCheckpointScreen  = (msg) => {
    checkpointScreen.style.display = "block"
    checkpointMessage.textContent = msg

    if(isCheckpointCollisionDetectionActive){
        setTimeout(()=>{checkpointScreen.style.display = "none"},2000)
    }

}

// functionality for start game
startBtn.addEventListener("click", startGame)

// calls movePlayer functionality
window.addEventListener("keydown", ({key})=>{
    movePlayer(key,8,true)
})

window.addEventListener("keyup", ({key})=>{
    movePlayer(key,0,false)
})