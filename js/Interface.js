
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

			/*
			var onMouseDown = function( event ) {
				var projector = new THREE.Projector();
				var vector = new THREE.Vector3(0,0,1);
				projector.unprojectVector(vector, Game.camera);
				var raycaster = new THREE.Raycaster(Game.player.body.position, vector.sub(Game.player.body.position).normalize() );
				var intersects = raycaster.intersectObjects( Object.getMeshes(Game.objects) );

				if(intersects.length) {
					var i = Object.getMeshes(Game.objects).indexOf(intersects[0].object);
					Game.objects[i].body.applyForce(new CANNON.Vec3(raycaster.ray.direction.x*10000,
																	raycaster.ray.direction.y*10000,
																	raycaster.ray.direction.z*10000), 
													Game.objects[i].body.position);
				}
			}
			onMouseDown();
			*/
		});
	}
	var container = document.createElement( 'div' );
	document.body.appendChild( container );
	Interface.stats = new Stats();
	Interface.stats.domElement.style.position = 'absolute';
	Interface.stats.domElement.style.top = '0px';
	container.appendChild( Interface.stats.domElement );
	
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