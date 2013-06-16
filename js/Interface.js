
Interface = {};

Interface.setup = function() {

	Interface.SCREEN_WIDTH = window.innerWidth || 2;
	Interface.SCREEN_HEIGHT = window.innerHeight || 2;

	var havePointerLock = 'pointerLockElement' in document || 
		'mozPointerLockElement' in document || 
		'webkitPointerLockElement' in document;

	if ( havePointerLock ) {
		var element = document.body;

		 var pointerlockchange = function ( event ) {
			if ( document.pointerLockElement === element || 
					document.mozPointerLockElement === element || 
					document.webkitPointerLockElement === element ) {
				Game.controls.enabled = true;
			} else {
				Game.controls.enabled = false;
			}
		}
		
		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
		window.addEventListener( 'resize', Interface.onWindowResize, false );
		
		var canFire = true;
		var onMouseDown = function( event ) {
			if (canFire && Game.player.live) {
				var projector = new THREE.Projector();
				var vector = new THREE.Vector3(0,0,1);
				projector.unprojectVector(vector, Game.camera);
				var raycaster = new THREE.Raycaster(Game.player.body.position, vector.sub(Game.player.body.position).normalize() );

				var intersects = raycaster.intersectObjects( Game.scene.children );
				
				if (intersects[0] && intersects[0].point) {
					Interface.createFire(raycaster.ray.origin, intersects[0].point, true);
					
					for (playerID in Game.otherPlayers) {
						if (intersects[0].object == Game.otherPlayers[playerID].mesh) {
							Network.socket.emit('playerDied', playerID);
							Game.otherPlayers[playerID].live = false;
							Game.scene.remove(Game.otherPlayers[playerID].mesh);
						}
					}
				}
				else {
					Interface.createFire(raycaster.ray.origin, 
											raycaster.ray.origin.vadd((new THREE.Vector3()).copy(raycaster.ray.direction).multiplyScalar(40)),
											true);
				}
				
				Game.player.body.applyForce(new CANNON.Vec3(-raycaster.ray.direction.x*Game.knockback,
											-raycaster.ray.direction.y*Game.knockback,
											-raycaster.ray.direction.z*Game.knockback),
							Game.player.body.position);
				
				canFire = false;
				setTimeout( function(){canFire = true;}, 1000);
			}
		}
		
		document.addEventListener( 'click', function(event) {
			element.requestPointerLock = element.requestPointerLock || 
									  element.mozRequestPointerLock || 
									  element.webkitRequestPointerLock;
									  
			if ( /Firefox/i.test( navigator.userAgent ) ) {
				var fullscreenchange = function ( event ) {

					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}
				}
				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {
				element.requestPointerLock();
			}

			onMouseDown();
			
		});
	}
	var container = document.createElement( 'div' );
	document.body.appendChild( container );
	Interface.stats = new Stats();
	Interface.stats.domElement.style.position = 'absolute';
	Interface.stats.domElement.style.top = '0px';
	Interface.stats.domElement.style.visibility = "hidden" //hide stats until the game starts
	container.appendChild( Interface.stats.domElement );
	
}

Interface.createFire = function(source, destination, local) {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(source);
	geometry.vertices.push(destination);
	var line = new THREE.Line(geometry,  new THREE.LineBasicMaterial( { color: 0xffffff} ) );
	Game.scene.add(line);
	
	if (local)
		Network.socket.emit('createFire', {source:source, destination:destination});
		
	setTimeout( function(){ Game.scene.remove(line);}, 300);
}

Interface.onWindowResize = function() {
	Interface.SCREEN_WIDTH = window.innerWidth || 2;
	Interface.SCREEN_HEIGHT = window.innerHeight || 2;
	
	Game.shaders["fxaaEffect"].uniforms[ 'resolution' ].value.set( 1 / Interface.SCREEN_WIDTH, 1 / Interface.SCREEN_HEIGHT );
	
	Game.camera.aspect = Interface.SCREEN_WIDTH / Interface.SCREEN_HEIGHT;
	Game.camera.updateProjectionMatrix();

	Game.composer.setSize( Interface.SCREEN_WIDTH, Interface.SCREEN_HEIGHT );
	Game.renderer.setSize( Interface.SCREEN_WIDTH, Interface.SCREEN_HEIGHT );

}