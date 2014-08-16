$(document).ready(function(){
	document.addEventListener('deviceready', function(){
		
		try{
			
			console.log('hello world');
			
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){ // success get file system
				
				fileSystem.root.getDirectory('dcim/Camera',{create:false}, function(oDirectory){
					
					oDirectory.createReader().readEntries(function(aEntries){ // success get files and folders
						var aImageFiles=new Array();
						
						for(var i=0; i<aEntries.length; ++i) {
							if(!aEntries[i].isFile) continue;
							if(!aEntries[i].name.match(/\.jpg$/)) continue;
							
							aImageFiles.push(aEntries[i]);
						}
						
						
						var iCurrent=0,
							iMax=aImageFiles.length;
	
						setInterval(function(){
							aImageFiles[iCurrent].file(function(oFile){
								var reader = new FileReader();
								reader.onloadend = function(evt) {
									$('body').css('background-image',"url('"+evt.target.result+"')");
								}; 
								reader.readAsDataURL(oFile);
							
							},function(){
								alert("can't open file");
							});
							
							iCurrent++;
							if(iCurrent>=iMax) iCurrent=0;
						},1000);						

					}, function(oError){ // error get files and folders
						alert(oError.code);
					});
			
				}, function(oError){
					alert(oError.code);
				})
			}, function(evt){ // error get file system
				alert('could not access file system');
			});
		} catch(e) {
			alert(e.message);
		}
		
	}, true);
});
