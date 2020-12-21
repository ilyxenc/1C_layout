$(document).ready(function() {

	var Xinner = 0;
	var Yinner = 0;
	var XinnerM = 0;
	var YinnerM = 0;

	var lk = $('.image-editor .image');

	var image = $(".image-editor .image");

	$('.image-editor .image').mousemove(function(e){
    	var pos = $(this).offset();
    	var elem_left = pos.left;
    	var elem_top = pos.top;
    	Xinner = e.pageX - elem_left;
    	Yinner = e.pageY - elem_top;
	});

	$(document).on("touchmove", '.image-editor', function(event) {

            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			var offset = (touch.clientX - $(event.target).offset().left);

            XinnerM = touch.clientX;
            YinnerM = touch.clientY - 300;

            console.log(XinnerM, YinnerM);

            event.stopPropagation();
            event.preventDefault();
	});

	$(".image-editor-right .de").each(function () {

		$(this).draggable({containment: "#capture", helper: "clone"});

	});

	$(image).droppable({
        drop: function(ev, ui) {

	        if($(ui.draggable).hasClass("de")) {

	        	var imgTD = $(ui.draggable).find("img").attr("src");

				if(XinnerM == 0) Xx = Xinner; else Xx = XinnerM;
				if(YinnerM == 0) Yy = Yinner; else Yy = YinnerM;

				console.log(Xinner, Yinner, XinnerM, YinnerM);

	        	var des = $('<div class="des"><div class="im" style="width: 64px; height: 64px;"><img src="' + imgTD + '"></div><div class="close">x</div></div>').appendTo($(this)).css({top: Yy-32, left: Xx-32});

	        	des.css("width", "auto").css("height", "auto");

	        	des.draggable(
	        	{
		        	containment: "#capture",
		        	stop: function() {
				        var offset = $(this).position();
				        var xPos = offset.left;
				        var yPos = offset.top;
				        $(this).css({left: xPos, top: yPos});
				    }
		        	});

		        des.find(".im").rotatable();
		        des.find(".im").resizable({aspectRatio: true});

		        $(".des").find(".close").click(function() { $(this).parent().remove(); })

	        }

		}
    });

	var uploadInput = $(".image-editor input[type=file]");

	function readURL(e) {

	    if (this.files && this.files[0]) {

			var reader = new FileReader();
			reader.onload = function(e) {

				image.html('<img id="cimage" src="' + e.target.result + '">');
				initCrop();

			}
			reader.readAsDataURL(this.files[0]);

	    }
	}

	function initCrop() {

		var okButton = $('<div class="crop-ok"></div>').appendTo(image);
		var rotateButton = $('<div class="crop-rotate"></div>').appendTo(image);

		var $image = $('#cimage');

		$image.cropper({
			aspectRatio: 4 / 3,
			crop: function(event) {

			}
		});

		rotateButton.on('click', function(ev) {

			$image.cropper("rotate", 90);

		});

		okButton.on('click', function (ev) {

			var croppedimage = $image.cropper('getCroppedCanvas', { width: 640, height: 480 }).toDataURL("image/jpeg");

			image.html("");

			$('<div id="main-i"><img id="main" src="' + croppedimage + '"></div>').appendTo(image);

			okButton.remove();

			initFilters();

		});

	}

	function initFilters() {

		var filters = $('.filters li a');

		var origImg = $('#main-i').html();

		filters.on("click", function() {

			$('#main-i').html(origImg);

			var filter = $(this).attr("data-filter");
			$('#main-i img').attr("data-filter", filter);

			$('#main-i img').filterMe();

		})

	}

	initSave();

	function initSave() {

		$(".save").on("click", function() {

			var c = document.getElementById("canvasForSave");
			var ctx = c.getContext("2d");
			var imageObj1 = new Image();

			var src = $("#capture img#main").attr("src");
			imageObj1.src = src;

			imageObj1.onload = function() {

				ctx.drawImage(imageObj1, 0, 0);

				var imagesInC = image.find("img");

				addLayer(ctx, imagesInC, c, 0);

			}

		});

	}

	function addLayer(ctx, imagesInC, c, current) {

		if(imagesInC[current]) {

			var cImg = imagesInC[current];

			if(cImg.id != "main") {

				var imageObjOther = new Image();
				imageObjOther.src = $(cImg).attr("src");
				var rotate = getRotationDegrees($(cImg).parent());

				var width = $(cImg).parent().width();
				var height = $(cImg).parent().height();

				var top = parseInt($(cImg).parent().parent().css("top"));
				var left = parseInt($(cImg).parent().parent().css("left"));

				imageObjOther.onload = function() {

					drawRotatedImage(ctx, imageObjOther, left, top, rotate, width, height);
// 					ctx.drawImage(imageObjOther, left, top, width, height);

					current++;

					addLayer(ctx, imagesInC, c, current);

				};

			} else {

				current++;

				addLayer(ctx, imagesInC, c, current);

			}

		} else {

			saveImage2(c);

		}

		function getRotationDegrees(obj) {
		    var matrix = obj.css("-webkit-transform") ||
		    obj.css("-moz-transform")    ||
		    obj.css("-ms-transform")     ||
		    obj.css("-o-transform")      ||
		    obj.css("transform");
		    if(matrix !== 'none') {
		        var values = matrix.split('(')[1].split(')')[0].split(',');
		        var a = values[0];
		        var b = values[1];
		        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
		    } else { var angle = 0; }
		    return (angle < 0) ? angle + 360 : angle;
		}

		var TO_RADIANS = Math.PI / 180;
		var drawRotatedImage = function (context, image, x, y, angle, width, height) {

		    context.save();

// 			context.translate(diagonal/2, diagonal/2);
// 		    context.translate(x, y);
			ctx.translate( x+width/2, y+height/2 );

		    context.rotate(angle * TO_RADIANS);

		    context.drawImage(image, -width/2, -height/2, width, height);

		    context.restore();

		}

	}

	function saveImage2(c) {

		var img = c.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");

		var link = document.getElementById('link');
		link.setAttribute('download', '1c.jpg');
		link.setAttribute('href', img);
		link.click();

	}

	$(uploadInput).change(readURL);

	var camera = $(".camera");
	var video = document.querySelector('#camera-stream');

	var closeButton = $(".video-close");
	var takePhotoButton = $(".video-take-photo");

	camera.on("click", function() {

		navigator.getMedia = ( navigator.getUserMedia ||
	    navigator.webkitGetUserMedia ||
	    navigator.mozGetUserMedia ||
	    navigator.msGetUserMedia);

		if(!navigator.getMedia){

			alert("Ваш браузер не поддерживает работу с вебкамерой");

	    } else{

		    $(".video").show();

	        navigator.getMedia(
	            {
	               video: true
	            }, function(stream){

					video.srcObject = stream;

	                video.play();
	                video.onplay = function() {

						takePhotoButton.on("click", function() {

					        var snap = takeSnapshot();

							image.html('<div id="main-i"><img id="main" src="' + snap + '"></div>');

					        video.pause();

					        $(".video").hide();

					        initFilters();

						});

	                };

	            },
	            function(err){

		            alert("Вы не резрешили доступ к камере");

	            }
	        );

	    }

	});

	function takeSnapshot(){
        // Here we're using a trick that involves a hidden canvas element.

        var hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        var width = video.videoWidth,
            height = video.videoHeight;

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);

            return hidden_canvas.toDataURL('image/png');
        }
    }

});

$(document).ready(function() {

	$(".to-bottom").click(function() {
		$("html, body").animate({ scrollTop: $(document).height() }, "slow");
		return false;
	});

	setInterval(chi, 2500);

	function chi() {

		$(".panno img").each(function() {

			var id = Math.floor((Math.random() * 3) + 1);

			$(this).attr("src", "./panno/" + id + ".jpg");

		});

	}

});
