let activateDropDown = (function(){
	let dropdownState = {},
 			allTargetNodes,
 			selection;

	 return {
		setState : function(dropdownName){
			
			//e.g. bike profifle .itemType
			//e.g. #itemType
			let dropdown = document.getElementById(dropdownName);
			//whatever is selected, values will always match
			selection = dropdown.options[dropdown.selectedIndex].dataset.attribute;
			
			dropdownState[dropdownName] = selection;

			return this;
		},
		hideOrDisplay : function(){
			let keys = Object.values(dropdownState);
			let allTargetNodes = document.querySelectorAll('.itemprofile');
			
			allTargetNodes.forEach(function(node){
				let rank = 0;
        let val = (typeof node.dataset.topics === 'object' && node.dataset.topics !== null) ? node.dataset.topics : JSON.parse(node.dataset.topics);
				let nodeDataset = Object.values(val);
				
				keys.forEach(function(e,index){
					if(nodeDataset.includes(e) || e === undefined){
						//undefined refers to 'ignore this aspect'
						rank++;
					}
					else{
						//rank = false;
					}
					if(index === keys.length-1){
						if(rank === keys.length){
							

							//test if table or div
							if(document.querySelectorAll('.itemprofile')[0].tagName === 'DIV'){
								node.style.display = 'flex';
							}
							else{
								node.style.display = 'table-cell';
							}
						}
						else{
							node.style.display = 'none';
						}
					}
				});
			});
		}
	}
})();
