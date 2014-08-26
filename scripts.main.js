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
		
			var sDeviceID=device.uuid;
			
			console.log('hello world');
			console.log('device: '+sDeviceID);
			
			document.addEventListener('menubutton', function(){}, false);
			
			window.plugins.insomnia.keepAwake();
			
			//navigator.camera.getPicture(function(){}, function(){}, { quality: 50 }); 
			
			/*
				THIS SECTION DEALS WITH SCANNING FOR IMAGES AND SHOWING THEM IN THE CAROUSEL
			*/
			
			
			var oGalleryImages=new function(){
				var _oGalleryImages=this,
					aGalleryImages={};//new Array(),
					iOpenScans=0,
					sStorageDir='dcim/slyncstagram';	
					
				function fFinishedScanning(){
					console.log('filesystem: finished scan');
					
					//console.log(JSON.stringify(aGalleryImages).replace(/,/g,',\n'));
					
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
							if(aItems[i].size>1200000) continue;
				
							//aImageFiles.push(aItems[i]);
							aImageFiles.push({
								name:aItems[i].name,
								path:aItems[i].toURL()
							});
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
				
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(oFileSystem){
					oFileSystem.root.getDirectory(sStorageDir,{create:false}, function(oDirectory){
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
						
						if(!aGalleryImages[sGroupName].images) continue;
						
						var aGroupImages=aGalleryImages[sGroupName].images;
						//console.log('filesystem: extracted '+aGroupImages.length+' images from group '+sGroupName);
						for(var j=0;j<aGroupImages.length;j++) aAllImages.push(aGroupImages[j]);
					}
					return aAllImages;//.shuffle();
				}		
				
				_oGalleryImages.listImages=function(){
					return aGalleryImages;
				}
				
				_oGalleryImages.listGroups=function(){
					var aAllGroups=Object.keys(aGalleryImages),
						aGroups=new Array();
						
					for(var i=0;i<aAllGroups.length;i++){
						var sGroupName=aAllGroups[i];
						if((!aGalleryImages[sGroupName].images)||(aGalleryImages[sGroupName].images.length==0)) continue;
						aGroups.push(sGroupName);
					}
					return aGroups;
				}
				
			} // end of gallery images object
			
			var oGallery=new function(){
				var _oGallery=this;
				
				var iCurrent=0,
					aImageFiles=new Array();//oGalleryImages.listImages()[sGallery].images.shuffle(),//.allImages();
					iMax=0,//aImageFiles.length,
					bRunning=false,
					sCurrentGroup='';
					
				console.log('gallery: there are '+aImageFiles.length+' images in the gallery');

				function fNextImg(){
					var _iCurrent=iCurrent,
						_sCurrentGroup=sCurrentGroup;
						
					console.log('gallery: working with image '+_iCurrent);
					console.log('gallery: image is on path '+aImageFiles[_iCurrent].path);
					
					window.resolveLocalFileSystemURL(aImageFiles[_iCurrent].path,function(oFileEntry){
						console.log('gallery: found image '+_iCurrent);
						
						oFileEntry.file(function(oFile){
							console.log('gallery: opened image '+_iCurrent);
							var reader = new FileReader();
							reader.onloadend = function(evt) {
								console.log('gallery: loaded image '+_iCurrent);
								
								//$(oCarousel).empty();
								
								var oImg=document.createElement('IMG');
								oImg.onload=function(){
									var _oImg=this,
										oImgHolder=document.createElement('DIV');
								
									$(oImgHolder).addClass('imgHolder');
									$(oImgHolder).append(_oImg);
									if($('body').children('#caption').attr('gallery_name')==_sCurrentGroup) $('body').children('#caption').appendTo(oImgHolder); // append a caption if there is one...
									$(oCarousel).append(oImgHolder);
								
									fSizeImage(_oImg,oImgHolder,true,false);
									console.log('gallery: showing image '+_iCurrent);
									console.log('gallery: finished with image '+_iCurrent);
									$(oImgHolder).prevAll().remove();
									setTimeout(function(){
										fNextImg();
									},1000);							
								};
								$(oImg).attr('src',evt.target.result);						
							}; 
							reader.readAsDataURL(oFile);
						}, function(){
							console.log("ERROR: gallery: can't open file");
							fNextImg();	
						});
					
					},function(){
						console.log("ERROR: gallery: can't find file");
						fNextImg();	
					});
					
					iCurrent++;
					if(iCurrent>=iMax) iCurrent=0;
				}
				
				_oGallery.load=function(sGallery){
					console.log('gallery: opening '+sGallery);
					 
					var aGroups=oGalleryImages.listGroups();
					if(aGroups.indexOf(sGallery)<0) return;
					
					sCurrentGroup=sGallery;
					window.localStorage.setItem('current_group',sCurrentGroup)
					
					iCurrent=0,
					aImageFiles=oGalleryImages.listImages()[sGallery].images.shuffle();//.allImages();
					iMax=aImageFiles.length;
					
					$('#caption').remove();
					var oCaption=document.createElement('DIV');
					$(oCaption).attr('id','caption');
					$(oCaption).attr('gallery_name',sGallery);
					$(oCaption).html(sGallery);
					$('body').append(oCaption);
					
					if(!bRunning) fNextImg();
					bRunning=true;
				}
				
				_oGallery.current_group=function(){
					if(sCurrentGroup) return sCurrentGroup;
					else return false;
				}
				
			}
			
			$(oGalleryImages).bind('ready',function(){
				if(window.localStorage.getItem('current_group')) oGallery.load(window.localStorage.getItem('current_group'));
				else {
					var aGroups=oGalleryImages.listGroups(),
						iRandomGroupIndex=Math.floor(Math.random()*aGroups.length),
						sRandomGroup=aGroups[iRandomGroupIndex];
					
					oGallery.load(sRandomGroup);
				}
			});
			
			/*
				END OF THE IMAGE CAROUSEL
			*/
			
			
			/*
				DEAL WITH THE WEBSOCKET CONNECTION
			*/
			console.log('websocket: starting websocket');
			
			function fAnnounce(){
				oSocket.emit('slyncstagram_announce',{
					device_id:sDeviceID,
					current_group:oGallery.current_group(),
					groups:oGalleryImages.listGroups()
				});
			}
			
			function fIdentify(){
				var oFlash=document.createElement('DIV');
				$(oFlash).attr('id','flash');
				$(oFlash).html('device_id:'+sDeviceID+'<br />group:'+oGallery.current_group());
				
				if(oData && oData.red && oData.green && oData.blue){
					var sRGB='rgb=('+oData.red+','+oData.green+','+oData.blue+')';
					$(oFlash).css('background-color',sRGB);
				}
				
				$('body').append(oFlash);
				
				setTimeout(function(){
					$(oFlash).remove();
				},4000);
			};
			
			var oSocket = io.connect('https://glue-11350.onmodulus.net',{'query':'appliance_id=slyncstagram'}),
				bSocketConnected=false;
				
			oSocket.on('connect',function(){
				bSocketConnected=true;
				console.log('websocket: connected to glue');
				fAnnounce();			
				fIdentify();
			});
			
			oSocket.on('connecting',function(){
				console.log('websocket: connecting to glue');
			});
	
			oSocket.on('disconnect',function(){
				bSocketConnected=false;
				console.log('websocket: disconnected from glue');
			});
			
			oSocket.on('slyncstagram_request_announce',function(){
				console.log('websocket: request announce received');
				fAnnounce();
			});
			
			oSocket.on('slyncstagram_identify',function(oData){
				if(!oData.device_id || (oData.device_id!=sDeviceID)) return;
				fIdentify(oData);
			});
			
			oSocket.on('slyncstagram_set_group',function(oData){
				if(!oData.device_id || (oData.device_id!=sDeviceID)) return;
				oGallery.load(oData.group);
			});
			
			
			
		} catch(e) {
			console.log('general error\n'+e.message);
		}
		
	}, true);
});
