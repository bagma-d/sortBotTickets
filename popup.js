// получаем доступ к кнопке
let snow = document.getElementById("do-sort");
// когда кнопка нажата — находим активную вкладку и запускаем нужную функцию
snow.addEventListener("click", async () => {
	
  // получаем доступ к активной вкладке
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // выполняем скрипт
  chrome.scripting.executeScript({
  	// скрипт будет выполняться во вкладке, которую нашли на предыдущем этапе
    target: { tabId: tab.id },
	
    // вызываем функцию
    function: arrange,
  });
});

function arrange() {
//==== функция-сортировщик ====
	function compare(field, order) {
		var len = arguments.length;
		if(len === 0) {
			return (a, b) => (a < b && -1) || (a > b && 1) || 0;
		}
		if(len === 1) {
			switch(typeof field) {
				case 'number':
					return field < 0 ?
						((a, b) => (a < b && 1) || (a > b && -1) || 0) :
						((a, b) => (a < b && -1) || (a > b && 1) || 0);
				case 'string':
					return (a, b) => (a[field] < b[field] && -1) || (a[field] > b[field] && 1) || 0;
			}
		}
		if(len === 2 && typeof order === 'number') {
			return order < 0 ?
				((a, b) => (a[field] < b[field] && 1) || (a[field] > b[field] && -1) || 0) :
				((a, b) => (a[field] < b[field] && -1) || (a[field] > b[field] && 1) || 0);
		}
		var fields, orders;
		if(typeof field === 'object') {
			fields = Object.getOwnPropertyNames(field);
			orders = fields.map(key => field[key]);
			len = fields.length;
		} else {
			fields = new Array(len);
			orders = new Array(len);
			for(let i = len; i--;) {
				fields[i] = arguments[i];
				orders[i] = 1;
			}
		}
		return (a, b) => {
			for(let i = 0; i < len; i++) {
				if(a[fields[i]] < b[fields[i]]) return orders[i];
				if(a[fields[i]] > b[fields[i]]) return -orders[i];
			}
			return 0;
		};
	}
	
	// //Использование
	// arr.sort(compare()); //Обычная типобезопасная сортировка по возрастанию
	// arr.sort(compare(-1)); //Обычная типобезопасная сортировка по убыванию
	// arr.sort(compare('field')); //Сортировка по свойству field по возрастанию
	// arr.sort(compare('field', -1)); //Сортировка по свойству field по убыванию
	// /* Сортировка сначала по полю field1
	//    при совпадении по полю field2, а если и оно совпало, то по полю field3
	//    все по возрастанию */
	// arr.sort(compare('field1', 'field2', 'field3'));
	// /* Сортировка сначала по полю field1 по возрастанию
	//    при совпадении по полю field2 по убыванию */
	// arr.sort(compare({
	//     field1 : 1,
	//     field2 : -1
	// }));

	const top = document.querySelector('.error');
	const settingsHTML = `
	<div class="settings">
		
	<fieldset class="params">
	  <legend>Параметры фильтрации:</legend>
	<div class="column" style="visibility:hidden;">
	  <div>
		<input type="checkbox" id="dc-a" name="alpha" checked>
		<label for="dc-a">α</label>
	  </div>
	
	  <div>
		<input type="checkbox" id="dc-b" name="betta" checked>
		<label for="dc-b">β</label>
	  </div>

	  <div>
		<input type="checkbox" id="dc-c" name="gamma" checked>
		<label for="dc-c">γ</label>
	  </div>
	</div>
	<div class="column">
	  <div>
		<input type="checkbox" id="disk" name="disk" checked>
		<label for="disk">HDD</label>
		</div>
		<div>
		<input type="checkbox" id="ram" name="ram">
		<label for="ram">Memory</label>
		</div>
		<div>
		<input type="checkbox" id="etc" name="etc">
		<label for="etc">Other</label>
		</div>
	</div>		
	</fieldset>
	<button id="applyB">Применить</button>
	  

  </div>
	`;
	if (document.getElementsByClassName('settings').length === 0) {
	top.insertAdjacentHTML('afterEnd',settingsHTML); }
	const applyButton = document.getElementById('applyB');
	const settings = {
		doAlpha: true,
		doBetta: true,
		doGamma: true,
		doHdd: true,
		doRam: false,
		doOther: false
	};
/*	let doAlpha = true;
	let doBeta = true;
	let doGamma = true;
	let doHdd = true;
	let doRAM = true;
	let doOther = true; 
	
	for (let setting in settings) {
		console.log(setting + ':' + settings[setting]);
	}
	*/
	const stateAlpha = document.getElementById('dc-a');
	stateAlpha.addEventListener('change', function(){
		if (this.checked) {settings.doAlpha = true; } 
		else {settings.doAlpha = false; 
			}});
	const stateBetta = document.getElementById('dc-b');
	stateBetta.addEventListener('change', function(){
		if (this.checked) {settings.doBetta = true; } 
		else {settings.doBetta = false; 
			}});
	const stateGamma = document.getElementById('dc-c');
	stateGamma.addEventListener('change', function(){
		if (this.checked) {settings.doGamma = true; } 
		else {settings.doGamma = false; 
			}});
	const stateHdd = document.getElementById('disk');
	stateHdd.addEventListener('change', function(){
		if (this.checked) {settings.doHdd = true; } 
		else {settings.doHdd = false; 
			}});
	const stateRam = document.getElementById('ram');
	stateRam.addEventListener('change', function(){
		if (this.checked) {settings.doRam = true; } 
		else {settings.doRam = false; 
			}});
	const stateOther = document.getElementById('etc');
	stateOther.addEventListener('change', function(){
		if (this.checked) {settings.doOther = true; } 
		else {settings.doOther = false; 
			}});

	const tickets = document.querySelectorAll('div.main > a');
	let checkRAM = true;

	
	//==== создание массива объектов-тикетов ====
	const ticketsNumbers = [];
	function oldGetTickets() {
	
	for (let e of tickets) {	
		const ticketRef = e.getAttribute('href');
		const ticketID = ticketRef.slice(ticketRef.indexOf('ITDC'), ticketRef.indexOf('ITDC') + 11);
	   const ticketSLA = e.querySelector('span > span:first-child').getAttribute('class');
	   const ticketString = e.querySelector('span > span:nth-child(2)').innerText;
	   const ticketTime = e.querySelector('span > span:last-child').innerText;
	   const ticketElapse = ticketTime.slice(0, ticketTime.indexOf(' '));
	   const ticketCheck = ticketTime.slice(ticketTime.indexOf(' ') + 1);
	   const isCloud = ticketString.indexOf('[CLOUD]') === 0 ? true : false;
		
	   if (ticketCheck === 'Check NOC component' || ticketCheck === 'Other') {
			const ticketType = 'Other';
			const ticketModule = ticketString;
			ticketsNumbers.push(Object ({
			ticketRef: e.getAttribute('href'),
			ticketMark: ticketSLA,
			ticketModule: ticketModule,
			ticketRack: '',
			ticketUnit: '',
			ticketType: ticketType,
			ticketElapse: ticketElapse,
			ticketCheck: ticketCheck,
			isCloud: isCloud,
			ticketID: ticketID
		}	));
	//	console.log(ticketsNumbers[e]);
	   } 
	   
	else 
	   {
	   const slashPosition = ticketString.indexOf('/');
	   const spaceAfterSlashPosition = ticketString.indexOf('(') - 1;
	   const firstTwodotsPosition = ticketString.indexOf(':');
	   const ticketModule = ticketString.slice(slashPosition - 6, slashPosition);
	   const ticketRack = ticketString.slice(slashPosition + 1, spaceAfterSlashPosition);
	   const ticketUnit = Number(ticketString.slice((ticketString.indexOf('slot') + 5), ticketString.indexOf(')')));
	  //нужно добавить логику с юнитом с буквой
	  // const ticketUnit = ticketString.slice(spaceAfterSlashPosition + 1, firstTwodotsPosition);
	   const sunstrUnit = ticketString.substring(firstTwodotsPosition + 1);
	   const secondTwodotsPosition = sunstrUnit.indexOf(':');
	   const sunstrUnit2 = sunstrUnit.substring(secondTwodotsPosition + 1);
	   const ticketType = sunstrUnit.slice(1, sunstrUnit.indexOf(':') - 1);
	   // есть еще диски U.2:0 например
	   const ticketInventoryNumber = sunstrUnit2.slice(1, sunstrUnit2.indexOf(':') - 1);
		
		ticketsNumbers.push(new Object ({
			ticketRef: e.getAttribute('href'),
			ticketMark: ticketSLA,
			ticketModule: ticketModule,
			ticketRack: ticketRack,
			ticketUnit: ticketUnit,
			ticketType: ticketType,
			ticketInventoryNumber: ticketInventoryNumber,
			ticketElapse: ticketElapse,
			ticketCheck: ticketCheck,
			isCloud: isCloud,
			ticketID: ticketID
		}	));
		}
		
		e.closest('a').remove();
	}
}
 
	// сбор инфы по новому 
	const strings2array = [];
	const ticketsLine = [];
	const baxButton = document.getElementById('open-tabs');
	function getTicketsArray() {

	if (strings2array.length == 0) {

	for (let i = 0; i < tickets.length; i++) {
		
		const ticketRef = tickets[i].getAttribute('href');
		const ticketTime = tickets[i].querySelector('span > span:last-child').innerText;		
		const ticketCheck = ticketTime.slice(ticketTime.indexOf(' ') + 1);
		const ticketSLA = tickets[i].querySelector('span > span:first-child').getAttribute('class');
		const ticketID = ticketRef.slice(ticketRef.indexOf('ITDC'), ticketRef.indexOf('ITDC') + 11);
		const ticketString = tickets[i].querySelector('span > span:nth-child(2)').innerText;
		strings2array.push(ticketString.split(' : '));
		if (ticketCheck === 'Check NOC component' || ticketCheck === 'Other') {
			const module = strings2array[i][0];
		//	console.log('mod: ', module);
		//	console.log('id: ', ticketID);
		//	console.log('type: ', ticketCheck);	
			if (ticketCheck !== 'Other') {const ticketElapse = ticketTime.slice(0, ticketTime.indexOf(' '));		
		//	console.log('SLA: ', ticketElapse);
		//	console.log(`${module} : ${ticketCheck} : ${ticketElapse}`);

			ticketsLine.push(new Object ({
				ticketRef: ticketRef,
				ticketID: ticketID,
				ticketMark: ticketSLA,
				ticketModule: module,
				ticketElapse: ticketElapse,
				ticketCheck: ticketCheck				
			}	));
		} else {
		//	console.log('');
			ticketsLine.push(new Object ({
				ticketRef: ticketRef,
				ticketID: ticketID,
				ticketMark: ticketSLA,
				ticketModule: module,
				ticketCheck: ticketCheck				
			}	));
		}
		} else {
		//	console.log('string: ', strings2array[i]);
			const module = strings2array[i][0].slice(strings2array[i][0].indexOf('VLA-'), strings2array[i][0].indexOf('/'));
		//	console.log('mod: ', module);
			const rack = strings2array[i][0].slice(strings2array[i][0].indexOf('/') + 1, strings2array[i][0].indexOf('(') - 1);
		//	console.log('rack: ', rack);
			const unit = strings2array[i][0].slice(strings2array[i][0].indexOf('t') + 2, strings2array[i][0].indexOf(')'));
		//	console.log('unit: ', unit);	
			const componentType = strings2array[i][1];	
		//	console.log('component: ', componentType);	
			const nodeInventory = strings2array[i][2];	
		//	console.log('node: ', nodeInventory);
		//	console.log('id: ', ticketID);
		//	console.log('type: ', ticketCheck);
			const ticketElapse = ticketTime.slice(0, ticketTime.indexOf(' '));			
		//	console.log('SLA: ', ticketElapse);
		//	console.log(`${module} : ${rack} : ${unit} : ${componentType} : ${ticketElapse}`);
		//	console.log('');

			ticketsLine.push(new Object ({
				ticketRef: ticketRef,
				ticketID: ticketID,
				ticketMark: ticketSLA,
				ticketModule: module,
				ticketRack: rack,
				ticketUnit: unit,
				ticketType: componentType,
				ticketInventoryNumber: nodeInventory,
				ticketElapse: ticketElapse,
				ticketCheck: ticketCheck				
			}	));
		}	
		tickets[i].closest('a').remove();
	}
}
	}
	//console.log(strings2array);	

	applyButton.onclick = function () {
	
	const container = document.querySelector('body > div.content > div.main');

	if(document.getElementsByClassName('fielded') !== null) {
	
	let fieldedTickets = document.querySelectorAll('.fielded');
	//console.log(fieldedTickets);
	fieldedTickets.forEach(ticket => {
		ticket.remove();
		});
		;}

	getTicketsArray();

	const fieldSortedTickets = ticketsLine.sort(compare({
		ticketModule: -1,
		ticketRack: -1,
		ticketUnit: -1
	}));	
	
	// очередь тикетов
	
	
	
	for (let i=0; i<fieldSortedTickets.length; i++) {	
	if (settings.doHdd === true && fieldSortedTickets[i].ticketCheck === 'Check drive'){
		lineBuilder();
	} else if (settings.doRam === true && fieldSortedTickets[i].ticketCheck === 'Check RAM') {
		lineBuilder();
	} else if (settings.doOther === true && fieldSortedTickets[i].ticketCheck !== 'Check drive' && fieldSortedTickets[i].ticketCheck !== 'Check RAM') {
		lineBuilder();
	} 
	function lineBuilder() {
		const cloudClass = fieldSortedTickets[i].ticketModule === 'VLA-04' || fieldSortedTickets[i].module === 'VLA-14' ? 'cloud' : '';
		const ladderClass = fieldSortedTickets[i].ticketUnit > 31 ? 'ladder' : '';
		const nocTicket = fieldSortedTickets[i].ticketCheck !== 'Other' ? `<div class="property">${fieldSortedTickets[i].ticketElapse}</div>` : '';
		const hwTicket = fieldSortedTickets[i].ticketCheck !== 'Other' && fieldSortedTickets[i].ticketCheck !== 'Check NOC component' ? 
						`<div class="property ${cloudClass}">${fieldSortedTickets[i].ticketRack}</div>
						<div class="property ${ladderClass}">${fieldSortedTickets[i].ticketUnit}</div>
						<div class="property">${fieldSortedTickets[i].ticketType}</div>
						<div class="property">${fieldSortedTickets[i].ticketInventoryNumber}</div>` 
						: '';
		const ticketBodyHTML = 
		`<a href="${fieldSortedTickets[i].ticketRef}" class="button fielded">
		<span class="cursor ">
			<div class="ticket">
				<div class="mark ${fieldSortedTickets[i].ticketMark}"></div>                
				<div class="property">${fieldSortedTickets[i].ticketModule}</div>
				${hwTicket}
				<div class="property">${fieldSortedTickets[i].ticketCheck}</div>
				${nocTicket}					
			</div>
		</span>
		</a>`;	
			
		container.insertAdjacentHTML('beforeend', ticketBodyHTML);
		//window.open(fieldSortedTickets[i].ticketRef, "_blank");
	}

	

	}
}	
	//console.log(newLine);
}



