// module aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Sleeping = Matter.Sleeping,
    Body = Matter.Body,
    Events = Matter.Events;

// create an engine
const engine = Engine.create();

// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        background: "#F7F4C8",
        width: 620,
        height: 850,
        showVelocity: true
    }
});

const world = engine.world;

// Création du sol
const ground = Bodies.rectangle(310, 820, 620, 60,
    {
        isStatic: true, // ie. non soumis à la gravité
        render: {
            fillStyle: "#E6B143"
        }
    });

// Création des murs
const leftWall = Bodies.rectangle(15, 395, 30, 790,
    {
        isStatic: true, // ie. non soumis à la gravité
        render: {
            fillStyle: "#E6B143"
        }
    });
const rightWall = Bodies.rectangle(605, 395, 30, 790,
    {
        isStatic: true, // ie. non soumis à la gravité
        render: {
            fillStyle: "#E6B143"
        }
    });
const topLine = Bodies.rectangle(310, 150, 620, 2, {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#E6B143" },
    label: "topLine",
});


// Ajout des élements sols et murs au monde
Composite.add(world, [ground, leftWall, rightWall, topLine]);


// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();
// run the engine
Runner.run(runner, engine);

// Variable globale currentBody
let currentBody = null;
let currentFruit = null;
let interval = null;
let disableAction = null;

function addCurrentFruit(){
    const randomFruit = getRandomFruit();

     const body = Bodies.circle(300, 50, 50, {
         label: randomFruit.label,
         isSleeping: true,
         render: {
             fillStyle: randomFruit.color,
             sprite: { texture: `/assets/img/${randomFruit.label}.png` }
         },
         restitution: 0.2
     });

     currentBody = body;
     currentFruit = randomFruit;

     // Ajout du fruit dans le monde
     Composite.add( world, [currentBody]);
}

function getRandomFruit() {
    const randomIndex = Math.floor( Math.random() *5);
    const fruit = FRUITS[randomIndex];

    if (currentFruit && currentFruit.label === fruit.label)
        return getRandomFruit(); // Nouveau tirage

    return fruit;
}



// Evenement pour lacher le fruit
window.onkeydown = (event) => {
    if (disableAction) return;


    // En fonction de la touche pressée, on applique des effets différents
    switch (event.code) {
        // Touche espace: Le fruit se "réveille" et reprend son comportement normal, donc tomber
        case "Space":
            disableAction = true;

            // On change l'état de sleeeping de currentBody
            Sleeping.set(currentBody, false);

            // Lancement d'un timer pour l'ajout d'un nouveau fruit
            setTimeout(() => {
                addCurrentFruit();
                disableAction = false;
            }, 1000);

        // Touche gauche: Déplacement vers la gauche
        case "ArrowLeft":
            if (interval) return;
            interval = setInterval(() => {
                if (currentBody.position.x -20 > 30)
                    Body.setPosition( currentBody, {
                        x: currentBody.position.x - 1,
                        y: currentBody.position.y
                    });
            }, 5);

        // Touche droite: Déplacement vers la droite
        case "ArrowRight":
            if (interval) return;
            interval = setInterval(() => {
                if (currentBody.position.x -20 < 590)
                    Body.setPosition( currentBody, {
                        x: currentBody.position.x + 1,
                        y: currentBody.position.y
                    });
            }, 5);
    }
}

window.onkeyup = (event) => {
    switch (event.code) {
        case "ArrowLeft":
        case "ArrowRight":
            clearInterval(interval);
            interval = null;
    }
};


Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
        if (collision.bodyA.label === collision.bodyB.label) {
            Composite.remove(world, [collision.bodyA, collision.bodyB]);

            const index = FRUITS.findIndex(
                (fruit) => fruit.label === collision.bodyA.label
            );

            // If last fruit, do nothing
            if (index === FRUITS.length - 1) return;

            const newFruit = FRUITS[index + 1];
            const body = Bodies.circle(
                collision.collision.supports[0].x,
                collision.collision.supports[0].y,
                newFruit.radius,
                {
                    render: {
                        fillStyle: newFruit.color,
                        sprite: { texture: `/Javascript-Jeu-Pasteque/assets/img/${newFruit.label}.png` },
                    },
                    label: newFruit.label,
                }
            );
            Composite.add(world, body);
        }
        if (
            (collision.bodyA.label === "topLine" ||
                collision.bodyB.label === "topLine") &&
            !disableAction
        ) {
            alert("Game over");
        }
    });
});



addCurrentFruit();