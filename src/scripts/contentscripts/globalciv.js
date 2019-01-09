$(document).ready(function () {

  var minLevel = 40, totalCiv = {'current':0,'target':0,'nb':0};
  $('table.stdArray.hc tr.line0,.line1').each(function(){

    var element = $(this),
      td = element.find('td.hr'),
      currentLevelTd = td.eq(0),
      currentLevel = parseInt(currentLevelTd.text().replace(/,/g, '')),
      invest = parseFloat(td.eq(1).text().replace(/,/g, ''));
      element.append($('<td class="investTarget tech_launchable bold">').on('click',function(){
        if( (amount = parseInt($(this).data('amount'))) >0) $('#civInvestAmount').val(amount);
      }));
      for(var i=2;i<40 && invest>Hyperiums7.civInvest[i];i++){
      }
      var targetLevel = i-1;
      minLevel = Math.min(minLevel,targetLevel);
      totalCiv['nb'] +=1;
	  totalCiv['current'] += currentLevel;
      totalCiv['target'] += targetLevel;
      if(targetLevel>currentLevel){
        currentLevelTd.append($('<span class="tech_launchable bold">&nbsp;->&nbsp;<b>'+targetLevel+'</b</span>'));
      }
  });
  
  var slots = 0;
  var addSlots = Hyperiums7.rankAdditionalSlots[Hyperiums7.getUserRank()];
  var next = (totalCiv['nb']+1-addSlots)*totalCiv['nb'];
  while(next <= totalCiv['current']) {
	  slots++;
	  next = (totalCiv['nb']+1+slots-addSlots)*(totalCiv['nb']+slots);
  }
  $('table.stdArray.hc').append(
  	$('<tr class="hlight">')
	  .append($('<td colspan="2" class="hr">').html('<b>'+totalCiv['current']+'</b> <span class="tech_launchable bold">&nbsp;->&nbsp;<b>'+totalCiv['target']+'</b</span> '))
	  .append($('<td >'))
	  .append($('<td colspan=3>').html("You have "+totalCiv['nb']+" planet(s) and <span class='tech_launchable bold'>"+slots+"</span> free slot(s).<br>You need <span class='tech_launchable bold'>"+next+"</span> to have an additional slot."))
	  .append($('<td id=totalInvest class="tech_launchable bold">')));
	
  $('table.stdArray.hc tr.stdArray').append(
	  function(){
	    var elementTr=$(this),
	      select=$('<select>').on('change',function(){
	        var target= $(this).val(),
	        investTarget = Hyperiums7.civInvest[target],
	        investTotal= 0;
	        
	        $('table.stdArray.hc tr.hlight').each(function(){
	
	        var element = $(this),
	          td = element.find('td.hr'),
	          currentLevel = parseInt(td.eq(0).text().replace(/,/g, '')),
	          invest = parseFloat(td.eq(1).text().replace(/,/g, '')),
	          tdInvestTarget = element.find('td.investTarget');
	          
	        if(investTarget>invest){
	          tdInvestTarget.html(numeral(investTarget-invest).format('0,0')).data('amount',(investTarget-invest));
	          investTotal+=(investTarget-invest);
	        }else{
	          tdInvestTarget.html("").data('amount',0);
	        }
	        
	      });
		  if(investTotal>0) {
	        $('#totalInvest').html(numeral(investTotal).format('0,0'));
		  } else {
		    $('#totalInvest').html('');
		  }
			
	    });
	    select.append($('<option>',{value:0,text:'-> Level'}));
	    for(var i=minLevel+1;i<40;i++) select.append($('<option>',{value:i, text:'Civ '+i}));
	    return select;
	  }
  );
    //hyperiums7.civInvest


});

//beka
