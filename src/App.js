import './App.css';

import React from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Text } from "react-konva";

//change size here, dimensions are X^2
const SIZE_SQUARED = 9; 

const INITIAL_STATE_RECT = generateRectangles(SIZE_SQUARED);
const INITIAL_STATE_TEXT = generateText();

const colorArray = ['#8CFFDA', '#8447FF', '#D972FF', '#FFB2E6', '#FFFFE8'];
let colorMod = 'normal';

function generateRectangles(sizeSquared){
  const size = sizeSquared * sizeSquared;
  
  const data = [...Array(size)].map((_, i) => ({  
    id: i.toString(),
    width: 50,
    height: 50,
    fill: '#FFFFE8',
    shadowBlur: 5,
    counter: 0,
  }));
  
  const rectObjArr = data.map((rect) => {
    return new Konva.Rect(rect);
  });
  
  return rectObjArr;
}

function generateText(){
  return [{  
    id: 'vertLine',
    x: 20,
    y: 15,
    offsetX: -5,
    fontFamily: 'Courier New (monospace)',
    text: 'Vertical Line',
    textDecoration: '',
    fontStyle: 'italic',
    fontSize: 30,
    fill: 'black',
    align: 'center',
    verticalAlign: 'top',
    selected: false,
  },{  
    id: 'horizonLine',
    x: (window.innerWidth*0.5),
    y: 15,
    offsetX: 95,
    fontFamily: 'Courier New (monospace)',
    text: 'Horizontal Line',
    textDecoration: '',
    fontStyle: 'italic',
    fontSize: 30,
    fill: 'black',
    align: 'center',
    verticalAlign: 'top',
    selected: false,
  },{  
    id: 'spiral',
    x: (window.innerWidth),
    y: 15,
    offsetX: 100,
    fontFamily: 'Courier New (monospace)',
    text: 'Spiral',
    textDecoration: '',
    fontStyle: 'italic',
    fontSize: 30,
    fill: 'black',
    align: 'center',
    verticalAlign: 'top',
    selected: false,
  }];
}

function debounce(fn, ms) {
  let timer;
  return _ => {
    clearTimeout(timer);
    timer = setTimeout(_ => {
      timer = null;
      fn.apply(this, arguments);
    }, ms);
  };
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/*new plan:
  1) actually initalize all of the react-konva shapes/nodes here & assign them to an array.
    (instead of initalizing them in the render method)
  2) in the handleClick method, directly access each instances setState to change color
*/
const App = () => {
  const rectRef = React.useRef([]);
  const [textOptions, setTextOptions] = React.useState(INITIAL_STATE_TEXT);
  const [dimensions, setDimensions] = React.useState({ 
    height: window.innerHeight,
    width: window.innerWidth,
  });
  
  React.useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      });
    }, 250);
    //listen for resize
    window.addEventListener('resize', debouncedHandleResize);
    //dont exponentially add more eventListeners
    return _ => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  });
  
  //const stage = new Konva.Stage
  const layer = new Konva.Layer();
  //INITIAL_STATE_RECT.map(rectangle => (layer.add(rectangle)));
  
  const normalDraw = (clickedIndex, clickedRect) => {
    clickedRect.fill(colorArray[(clickedRect.attrs.counter%colorArray.length)]);
    clickedRect.attrs.counter += 1;
    console.log(clickedIndex);
  };
  
  const vertLineDraw = (clickedIndex, clickedRect) => {
    rectRef.current.forEach((rectangle,index) => {
      if((index+1)%SIZE_SQUARED === (clickedIndex+1)%SIZE_SQUARED) {
        rectangle.fill(colorArray[(rectangle.attrs.counter%colorArray.length)]);
        rectangle.attrs.counter += 1;
      }
    });
  };
  
  const horizontalLineDraw = (clickedIndex, clickedRect) => {
    rectRef.current.forEach((rectangle,index) => {
      if(Math.floor((index)/SIZE_SQUARED) === Math.floor((clickedIndex)/SIZE_SQUARED)) {
        rectangle.fill(colorArray[(rectangle.attrs.counter%colorArray.length)]);
        rectangle.attrs.counter += 1;
      }
    });
  };
  
  const spiralLineDraw = async (clickedIndex, clickedRect) => {
    let rectangleIndex = clickedIndex;
    let stepCounter = 1;
    let timesToIterateCounter = 1;
    let inBounds = true;
      
    //stop when out of index, dont have to worry about out of bounds
    while(rectangleIndex >= 0 && rectangleIndex < rectRef.current.length && inBounds){ 
      
      //repeat as many times as needed
      for(let repeats = 0; repeats < timesToIterateCounter && inBounds; repeats++){

        //find index in array, 'click it'
        let currentRect = rectRef.current[rectangleIndex];
        currentRect.fill(colorArray[(currentRect.attrs.counter%colorArray.length)]);
        currentRect.attrs.counter += 1;
        
        //previous method of 'animation'
        await delay(100);
        
        //move index the correct way based on what step
        switch(stepCounter%4){
          case 1:  
            //stop out of bounds up or move up
            rectangleIndex < SIZE_SQUARED**2 && rectangleIndex >= SIZE_SQUARED**2-SIZE_SQUARED 
            ? inBounds = false
            : rectangleIndex = rectangleIndex + SIZE_SQUARED;
            break;
          case 2:  
            //stop out of bounds right or move right
            (rectangleIndex)%SIZE_SQUARED === 0 
            ? inBounds = false 
            : rectangleIndex = rectangleIndex - 1;
            break;
          case 3:  
            //stop out of bounds up or move up
            rectangleIndex < SIZE_SQUARED && rectangleIndex >= 0  
            ? inBounds = false
            : rectangleIndex = rectangleIndex - SIZE_SQUARED;
            break;
          default:
            //stop out of bounds left or move left
            (rectangleIndex+1)%SIZE_SQUARED === 0 
            ? inBounds = false 
            : rectangleIndex = rectangleIndex + 1;
            break;
        }
      }
      
      //count the step
      stepCounter+=1;
      
      //every 2 steps, add 1 repeat to cycle done
      if(stepCounter/2 > timesToIterateCounter && inBounds){
        timesToIterateCounter += 1;
      }
    }
  };
  
  const exponentialExpandDraw = (clickedIndex, clickedRect) => {
    
  }
  
  const onRectClick = (e) => {
    const clickedIndex = e.target.index;
    const clickedRect = rectRef.current[e.target.index];
    
    switch(colorMod){
      case 'normal':
        normalDraw(clickedIndex, clickedRect);
        break;
      case 'vertLine':
        vertLineDraw(clickedIndex, clickedRect);
        break;
      case 'horizonLine':
        horizontalLineDraw(clickedIndex, clickedRect);
        break;
      case 'spiral':
        spiralLineDraw(clickedIndex, clickedRect);
        break;
      default: break;
    }
  };
  
  const handleTextClick = (e) => {
    const id = e.target.id();
    
    setTextOptions(
      textOptions.map((text) => {
        if((text.id) === id) {//match
          if(text.selected){ //double click = disable
            colorMod = 'normal';
            text.selected = false;
            return {
              ...text,
              textDecoration: '',
            };
            
          } else { //if not clicked already
            colorMod = id;
            text.selected = true;
            return {
              ...text,
              textDecoration: 'underline',
            };
          }
          
        } else { //de-select other options on selection of other option
          text.selected = false;
          return { 
            ...text,
            textDecoration: '',
          };
        }
      })
    );
  };
  
  return (
    <div>
    <div>Rendered at {dimensions.width} x {dimensions.height}</div>
    <Stage width={dimensions.width} height={dimensions.height}>
      <Layer {...layer}>
        {INITIAL_STATE_RECT.map((rectangle, index) => (
          <Rect {...rectangle}
            x={((dimensions.width/2 - 55 - (index%SIZE_SQUARED) * 55) + (55 * SIZE_SQUARED / 2) )}
            y={(dimensions.height/2 - ((Math.floor(index/SIZE_SQUARED)) * 55) + (SIZE_SQUARED * 25))}
            key={index}
            index={index}
            ref={(element) => {
              rectRef.current[index] = element;
            }}
            onClick={onRectClick}
          />
        ))}
        <Rect
          key="toolbarBackground"
          id="toolbarBackground"
          x={0}
          y={0}
          width={dimensions.width}
          height={dimensions.height/20 + 10}
          fillLinearGradientStartPoint={{ x: window.innerWidth/5, y: 0 }}
          fillLinearGradientEndPoint={{ x: window.innerWidth, y: window.innerHeight/20 }}
          fillLinearGradientColorStops={[0, colorArray[0], 0.25, colorArray[1], 0.5, colorArray[2], 0.75, colorArray[3], 1, colorArray[4]]}
          shadowBlur={10}
          stroke="#5E6572"
        />
        {textOptions.map((text,index) => (
          <Text 
            x={dimensions.width*(index/(textOptions.length-1))}
            y={20}
            offsetX={text.offsetX}
            key={text.id}
            id={text.id}
            text={text.text}
            fontFamily={text.fontFamily}
            textDecoration={text.textDecoration}
            fontStyle={text.fontStyle}
            fill={text.fill}
            align={text.align}
            verticalAlign={text.verticalAlign}
            fontSize={text.fontSize}
            onClick={handleTextClick}
          />
        ))}
      </Layer>
    </Stage>
    </div>
  );
};

export default App;