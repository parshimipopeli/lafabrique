$(document).ready(function()
{

	var CheminComplet = document.location.href;
	var CheminRepertoire  = CheminComplet.substring(CheminComplet.lastIndexOf( "/" ) );
	console.log(CheminRepertoire);

	switch (CheminRepertoire) {
		case '/smart-city' :
			$('.smartCity a').css('color', 'rgb(199,211,52)');
			console.log("vert");
			break;
		case '/co-working' :
			$('.coWorking a').css('color', 'rgb(199,211,52)');
			break;
		case '/fablab' :
			$('.fablab a').css('color', '#159d92');
			break;
		case '/bookkafe' :
			$('.bookkafe a').css('color', '#e21945');
			break;
		case '/loaction' :
			$('.loaction a').css('color', 'rgb(199,211,52)');
			break;
		case '/event' :
			$('.event a').css('color', 'rgb(199,211,52)');
			break;
		case '/blog' :
			$('.blog a').css('color', 'rgb(199,211,52)');
			break;
		case '/contact' :
			$('.contact a').css('color', 'rgb(199,211,52)');
			break;
	}


	var event = $_GET('event');

	

	if (event=="fablab") {
		$('#fablabCheck').attr("checked","checked");
		$('.Fablab').show();
		$('.Bookkafé').hide();
		$('.Smart-City').hide();
		console.log('ok');
	}
	if (event=="book") {
		$('bookCheck').attr("checked","checked");
		$('.Fablab').hide();
		$('.Bookkafé').show();
		$('.Smart-City').hide();
	}
	if (event=="smart") {
		$('#smartCheck').attr("checked","checked");
		$('.Fablab').hide();
		$('.Bookkafé').hide();
		$('.Smart-City').show();
	}


});