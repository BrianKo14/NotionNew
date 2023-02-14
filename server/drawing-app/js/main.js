const canvas = document.getElementById('canvas'); 
const fabricCanvas = new fabric.Canvas(canvas);

fabricCanvas.isDrawingMode = true;
fabricCanvas.freeDrawingBrush.width = 5;

fabricCanvas.setWidth(window.innerWidth);
fabricCanvas.setHeight(window.innerHeight);