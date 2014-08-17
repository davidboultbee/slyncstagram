$(document).ready(function(){

	var oCarousel=document.createElement('DIV');
	$(oCarousel).attr('id','carousel');
	$(oCarousel).addClass('waiting');
	$('body').append(oCarousel);

	document.addEventListener('deviceready', function(){
		
		try{
			
			console.log('hello world');
			//window.plugins.insomnia.keepAwake();
			
			//navigator.camera.getPicture(function(){}, function(){}, { quality: 50 }); 
			
			/*
				THIS SECTION DEALS WITH SCANNING FOR IMAGES AND SHOWING THEM IN THE CAROUSEL
			*/
			
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){ // success get file system
				
				console.log('gallery: got file system');
				fileSystem.root.getDirectory('dcim/Camera',{create:false}, function(oDirectory){
					
					console.log('gallery: got root directory');
					oDirectory.createReader().readEntries(function(aEntries){ // success get files and folders
						
						console.log('gallery: there are '+aEntries.length+' files');
						var aImageFiles=new Array();
						
						for(var i=0; i<aEntries.length; ++i) {
							if(!aEntries[i].isFile) continue;
							if(!aEntries[i].name.match(/\.jpg$/)) continue;
							
							aImageFiles.push(aEntries[i]);
						}
						
						console.log('gallery: there are '+aImageFiles.length+' image .jpg files');
						
						var iCurrent=0,
							iMax=aImageFiles.length;
	
						function fNextImg(){
							var _iCurrent=iCurrent;
							console.log('gallery: working with image '+_iCurrent);
							aImageFiles[_iCurrent].file(function(oFile){
								console.log('gallery: opened image '+_iCurrent);
								var reader = new FileReader();
								reader.onloadend = function(evt) {
									console.log('gallery: loaded image '+_iCurrent);
									var oImg=document.createElement('IMG');
									oImg.onload=function(){
										var _oImg=this,
											oImgHolder=document.createElement('DIV');
										
										$(oImgHolder).addClass('imgHolder');
										$(oImgHolder).append(_oImg);
										$(oCarousel).append(oImgHolder);
										
										fSizeImage(_oImg,oImgHolder,true,false);
										$(oImgHolder).css({left:'100%'});
										console.log('gallery: showing image '+_iCurrent);
										$(oImgHolder).animate({left:'-5px'},1000,function(){
											console.log('gallery: finished with image '+_iCurrent);
											$(oImgHolder).prevAll().remove();
											setTimeout(function(){
												fNextImg();
											},1000);
										});										
									};
									$(oImg).attr('src',evt.target.result);						
								}; 
								reader.readAsDataURL(oFile);
							
							},function(){
								console.log("ERROR: gallery: can't open file");
								fNextImg();	
							});
							
							iCurrent++;
							if(iCurrent>=iMax) iCurrent=0;
						}
						fNextImg();						

					}, function(oError){ // error get files and folders
						alert('ERROR: gallery: cannot open files and folders',oError.code);
					});
			
				}, function(oError){
					alert('ERROR: gallery: cannot create directory reader',oError.code);
				});
			}, function(evt){ // error get file system
				alert('ERROR: gallery: could not access file system');
			});
			
			/*
				END OF THE IMAGE CAROUSEL
			*/
			
			
			/*
				DEAL WITH THE WEBSOCKET CONNECTION
			*/
			console.log('websocket: starting websocket');
			
			var oSocket = io.connect();//'https://glue-11350.onmodulus.net',{'query':'appliance_id=slyncstagram'}),
				bSocketConnected=false;
				
			oSocket.on('connect',function(){
				bSocketConnected=true;
				console.log('websocket: connected to glue');
				alert('connected to glue');
			});
			
			oSocket.on('connecting',function(){
				console.log('websocket: connecting to glue');
			});
	
			oSocket.on('disconnect',function(){
				bSocketConnected=false;
				console.log('websocket: disconnected from glue');
			});
			
			oSocket.on('lights',function(oData){
				console.log('websocket: lights info received.\n'+oData);
			});
			
		} catch(e) {
			console.log('general error\n'+e.message);
		}
		
	}, true);
});
