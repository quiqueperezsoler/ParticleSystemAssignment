    // ----- Start of the assigment ----- //

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();
		// Set start and duration for this effect in milliseconds
		this.start    = 0;
		this.duration = 500;
		// Create a sprite
		let sp        = game.sprite("CoinsGold000");

		/* NEW CODE */
		const numSprites = 10; //setting the number of coin sprites to make
		this.sprites = []; //initializing array of sprites for coin rain

		var i;
		for(i=0; i<numSprites; i++){ //creating sprite and adding to sprite array
		    let sp      = game.sprite("CoinsGold000");
            // Set pivot to center of said sprite
            sp.pivot.x    = sp.width/2;
            sp.pivot.y    = sp.height/2;
            // Add the sprite particle to our particle effect
            this.addChild(sp);
		    this.sprites.push(sp);
		}
		/* END OF NEW CODE */
	}
	animTick(nt,lt,gt) {
		console.log("Call animTick and nt, lt, gt are: %d, %d, %d ", nt, lt, gt);
		// Every update we get three different time variables: nt, lt and gt.
		//   nt: Normalized time in procentage (0.0 to 1.0) and is calculated by
		//       just dividing local time with duration of this effect.
		//   lt: Local time in milliseconds, from 0 to this.duration.
		//   gt: Global time in milliseconds,
		console.log("animTick: nt with decimal points = "+ nt);

		// Set a new texture on a sprite particle
		let num = ("000"+Math.floor(nt*8)).substr(-3); //Selects the three last numbers of the nt*8
		console.log("animTick: num = "+ num);

        /* NEW CODE */
		var power = 1;
		var neg= -1;
		var x;
		var y;
		var normv;

		for (const sp of this.sprites){
            game.setTexture(sp,"CoinsGold"+num);
            // Animate position
            x= randomNumber(-800, 800); //picks a random position x within the width of the canvas
            y= randomNumber(-450, 450); //picks a random position y within the height of the canvas
            normv= Math.random(); //picks random number between 0 and 1
            //Math.pow(-1, power) alternates between signs (+ and -) so negative values are also included in z.
            //sp.axis = origin_axis + time*normalizing_vector*Sign_randomizer*direction_in_axis
            sp.x = 400 + nt*normv*Math.pow(-1, power)*x;
            sp.y = 225 + nt*normv*Math.pow(-1, power)*y;
            // Animate scale
            sp.scale.x = sp.scale.y = nt; //nt grows gradually with each call (range from 0 to 1)
            // Animate alpha
            sp.alpha = nt;
            // Animate rotation
            sp.rotation = nt*Math.PI*2*Math.random(); //added a randomizer for different animation results
            power++;
		}
        /* END NEW CODE */
	}
}

function randomNumber(min, max) {
     return Math.floor(Math.random() * (max - min) + min);
 }

// ----- End of the assignment ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(800,450);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {
		this.isRunning = true;
		this.t0 = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(eff) {
		this.totalDuration = Math.max(this.totalDuration,(eff.duration+eff.start)||0);
		this.effects.push(eff);
		this.stage.addChild(eff);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let gt = Date.now();
		let lt = (gt-this.t0) % this.totalDuration;
		for (let i=0; i<this.effects.length; i++) {
			let eff = this.effects[i];
			if (lt>eff.start+eff.duration || lt<eff.start) continue;
			let elt = lt - eff.start;
			let ent = elt / eff.duration;
			eff.animTick(ent,elt,gt);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);// sprite is saved in PIXI with a name for the Texture
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name]; //texture is loaded from the texture cache based on name
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		game.addEffect(new ParticleSystem());
	}});
}
