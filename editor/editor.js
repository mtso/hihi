(function() {
    var throttle = function(thresh, cb) {
      var last = Date.now();
      return function(event) {
        if (Date.now() - last > thresh) {
          last = Date.now();
          cb(event);
        }
      }
    }
    var $ = function(id){return document.getElementById(id)};
    var isMouseDown = false;
    var pointerBuffer = new Array();
    var previousBuffer = new Array();
  
    var cursorCanvas = this.__cursorCanvas = new fabric.StaticCanvas('cursorCanvas', {
      isDrawingMode: false,
    })
    var canvas = this.__canvas = new fabric.Canvas('c', {
      isDrawingMode: true,
      backgroundColor: 'black',
    });
    var circRadius = 10
    var circ = new fabric.Circle({
      radius: circRadius,
      width: 50,
      height: 50,
      left: 100,
      top: 100,
      stroke: 'pink',
      strokeWidth: 5,
      fill: '#fff',// '#faa',
      selectable: false,
      zIndex: 1000
    });
    
    function onMouseDown(event) {
      isMouseDown = true;
      pointerBuffer.push({
        x: event.pointer.x,
        y: event.pointer.y,
        t: Date.now(),
        e: 0,
      });
      
      circ.setOptions({
        left: event.pointer.x - 27,
        top: event.pointer.y - 27,
      });
      cursorCanvas.add(circ);
    }
    function onMouseUp(event) {
      isMouseDown = false;
      pointerBuffer.push({
        x: event.pointer.x,
        y: event.pointer.y,
        t: Date.now(),
        e: 2,
      });
      console.log(pointerBuffer);
      previousBuffer = previousBuffer.concat(pointerBuffer);
      pointerBuffer = new Array();
      cursorCanvas.remove(circ);
    }
    function onMouseMove(event) {
      if (isMouseDown) {
        pointerBuffer.push({
          x: event.pointer.x,
          y: event.pointer.y,
          t: Date.now(),
          e: 1,
        });
        
        // canvas.bringToFront(circ)
        circ.animate('top', event.pointer.y - 27
                     , {
          duration: 1000 / 120,
          onChange: cursorCanvas.renderAll.bind(cursorCanvas),
          easing: fabric.util.easeOutQuad,
        });
        circ.animate('left', event.pointer.x - 27
                     , {
          duration: 1000 / 120,
          onChange: cursorCanvas.renderAll.bind(cursorCanvas),
          easing: fabric.util.easeOutQuad,
        });
      }
    }
    
    canvas.on("mouse:move", throttle(1000 / 60, onMouseMove));
    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:up", onMouseUp);
  
    fabric.Object.prototype.transparentCorners = false;
    
    function encodeHihi(buffer) {
      let lines = ''
      for (let i = 0; i < buffer.length; i++) {
        lines += JSON.stringify(buffer[i]) + "\n";
      }
      return lines;
    }
    
    $('playback').addEventListener('click', function(event) {
      console.log(encodeHihi(previousBuffer))
      var i = 0;
        
      var t = setInterval(function() {
        if (i >= previousBuffer.length) {
          clearInterval(t);
          t = null;
          return;
        }
        var data = previousBuffer[i];
        switch (data.e) {
          case 0:
            canvas.getContext().beginPath();
            canvas.getContext().lineCap = 'round'
            canvas.getContext().moveTo(data.x, data.y);
            // canvas.getContext().filter = 'blur(10)';
            
            canvas.getContext().strokeStyle = 'pink';
            canvas.getContext().lineWidth = 10;
            circ.setOptions({
              left: data.x - 27,
              top: data.y - 27,
            })
            cursorCanvas.add(circ);
            break;
          case 1:
            // canvas.getContext().filter = 'blur(10)';
            // canvas.getContext().filter = 'drop-shadow(0px 0px 5px pink)';
            canvas.getContext().lineTo(data.x, data.y);
                  canvas.getContext().stroke();
            // canvas.getContext().beginPath();
            cursorCanvas.remove(circ);
            circ.setOptions({
              left: data.x - 27,
              top: data.y - 27,
            })
            cursorCanvas.add(circ);
            break;
          case 2:
            canvas.getContext().lineTo(data.x, data.y);
            canvas.getContext().stroke();
            // canvas.getContext().filter = 'none';
            cursorCanvas.remove(circ);
            break;
        }
  
        i += 1;
      }, 1000 / 30);
    });
    
    $('clear').addEventListener('click', function(event) {
      canvas.clear();
      canvas.backgroundColor = 'black'
      previousBuffer = new Array();
    });
    
    $('save').addEventListener('click', function(event) {
      console.log(encodeHihi(previousBuffer))
      fetch('https://hihifi.glitch.me/animations', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'hihi': previousBuffer,
        }),
      }).then((resp) => resp.json()).then((result) => {
        console.log(result)
        $('saved-id').innerText = "https://mtso.github.io/hihi/?id=" + result.id
        $('saved-id').setAttribute('href', "https://mtso.github.io/hihi/?id=" + result.id)
      })
    })
  
    if (canvas.freeDrawingBrush) {
      // canvas.freeDrawingBrush.zIndex = -1000;
      canvas.freeDrawingBrush.color = 'pink';
      canvas.freeDrawingBrush.width = 10;
      
      //drawingColorEl.value;
      // canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(this);
      // canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
      // canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      //   // blur: 10 / 2,
      //   offsetX: 0,
      //   offsetY: 0,
      //   affectStroke: true,
      //   color: 'pink',//drawingShadowColorEl.value,
      // });
    }
  })();