function fFailFiles(cError) {        
  if (cError.code == FileError.NOT_FOUND_ERR) return("Message : NOT_FOUND_ERR" )
  else if (cError) return("Message : SECURITY_ERR" )
  else if (cError.code == FileError.ABORT_ERR) return("Message : ABORT_ERR" )
  else if (cError.code == FileError.NOT_READABLE_ERR) return("Message : NOT_READABLE_ERR" )
  else if (cError.code == FileError.ENCODING_ERR) return("Message : ENCODING_ERR" )
  else if (cError.code == FileError.NO_MODIFICATION_ALLOWED_ERR) return("Message : NO_MODIFICATION_ALLOWED_ERR" )
  else if (cError.code == FileError.INVALID_STATE_ERR) return("Message : INVALID_STATE_ERR" )
  else if (cError.code == FileError.SYNTAX_ERR) return("Message : SYNTAX_ERR" )
  else if (cError.code == FileError.INVALID_MODIFICATION_ERR) return("Message :  INVALID_MODIFICATION_ERR" )
  else if (cError.code == FileError.QUOTA_EXCEEDED_ERR) return("Message : QUOTA_EXCEEDED_ERR" )
  else if (cError.code == FileError.PATH_EXISTS_ERR) return("Message : PATH_EXISTS_ERR" )  
}  


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
			
			
			var oGalleryImages=new function(){
				var _oGalleryImages=this,
					aGalleryImages=new Array(),
					iOpenScans=0,
					oFileSystem;	
					
				function fFinishedScanning(){
					console.log('filesystem: finished scan');
					$(_oGalleryImages).trigger('ready');
				}
			
				function fReadDirectory(oDirectory) {
					iOpenScans++;
					//console.log('filesystem: scanning directory '+oDirectory.fullPath);
					//console.log('filesystem: there are currently '+iOpenScans+' scans running');
					var sDirPath=oDirectory.fullPath,
						sDirName=oDirectory.name;
										
					oDirectory.createReader().readEntries(function(aItems){
						//console.log('filesystem: there are '+aItems.length+' items in '+sDirPath);
						var aImageFiles=new Array();
				
						for(var i=0; i<aItems.length; ++i) {
							if(aItems[i].isDirectory) {
								fReadDirectory(aItems[i]);
								continue;
							}
					
							if(!aItems[i].name.match(/\.jpg$/i)) continue;
				
							aImageFiles.push(aItems[i]);
						}
						
						//console.log('filesystem: found '+aImageFiles.length+' images in '+sDirName);
						
						aGalleryImages[sDirName]={
							path:sDirPath,
							images:aImageFiles
						}
				
						iOpenScans--;
						//console.log('filesystem: finished with directory '+sDirPath);
						//console.log('filesystem: there are currently '+iOpenScans+' scans running');
						
						if(iOpenScans==0) fFinishedScanning();
				
					},function(oError){
						console.log('E: filesystem: could not read file entries in dir '+sDirPath);
					});
				}	// end of fReadDirectory
				
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(_oFileSystem){
					oFileSystem=_oFileSystem;
					
					oFileSystem.root.getDirectory('dcim/slyncstagram',{create:false}, function(oDirectory){
						//console.log('filesystem: got initial directory');
						var sDirName=oDirectory.name;
						fReadDirectory(oDirectory);
						
					},function(oError){
						console.log('E: filesystem: could not get directory '+sDirPath+'\n'+fFailFiles(oError));
					});
				},function(oEvt){
						console.log('E: filesystem: could not access filesystem');
				});	
				
				_oGalleryImages.allImages=function(){
					var aAllImages=new Array(),
						aAllGroups=Object.keys(aGalleryImages);
						
					for(var i=0;i<aAllGroups.length;i++){
						var sGroupName=aAllGroups[i];
						//console.log('filesystem: extracting images from group '+sGroupName);
						
						var aGroupImages=aGalleryImages[sGroupName].images;
						//console.log('filesystem: extracted '+aGroupImages.length+' images from group '+sGroupName);
						for(var j=0;j<aGroupImages.length;j++) aAllImages.push(aGroupImages[j]);
					}
					return aAllImages;
				}		
				
			} // end of gallery images object
			
			$(oGalleryImages).bind('ready',function(){
				console.log('gallery: beginning');
				
				var iCurrent=0,
					aImageFiles=oGalleryImages.allImages();
					iMax=aImageFiles.length;
					
				console.log('gallery: there are '+aImageFiles.length+' images in the gallery');

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
								console.log('gallery: showing image '+_iCurrent);
								console.log('gallery: finished with image '+_iCurrent);
								$(oImgHolder).prevAll().remove();
								setTimeout(function(){
									fNextImg();
								},2000);								
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
			});
			
			/*
			 // success get file system
				
				console.log('filesystem: got file system');
				fileSystem.root.getDirectory('dcim/slyncstagram',{create:false}, function(oDirectory){
					
					console.log('gallery: got root directory');
					 // success get files and folders
						
						console.log('gallery: there are '+aEntries.length+' files');
						var aImageFiles=new Array();
						
						for(var i=0; i<aEntries.length; ++i) {
							if(!aEntries[i].isFile) continue;
							if(!aEntries[i].name.match(/\.jpg$/)) continue;
							
							aImageFiles.push(aEntries[i]);
						}
						
						console.log('gallery: there are '+aImageFiles.length+' image .jpg files');
						
											

					}, function(oError){ // error get files and folders
						alert('ERROR: gallery: cannot open files and folders',oError.code);
					});
			
				}, function(oError){
					alert('ERROR: gallery: cannot create directory reader',oError.code);
				});
			}, function(evt){ // error get file system
				alert('ERROR: gallery: could not access file system');
			});
			
			
			*/
			/*
				END OF THE IMAGE CAROUSEL
			*/
			
			
			/*
				DEAL WITH THE WEBSOCKET CONNECTION
			*/
			console.log('websocket: starting websocket');
			
			var oSocket = io.connect('https://glue-11350.onmodulus.net',{'query':'appliance_id=slyncstagram'}),
				bSocketConnected=false;
				
			oSocket.on('connect',function(){
				bSocketConnected=true;
				console.log('websocket: connected to glue');
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
