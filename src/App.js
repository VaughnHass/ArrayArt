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
  
  return [...Array(size)].map((_, i) => ({  
    id: i.toString(),
    x: ((window.innerWidth/2 - (i%sizeSquared) * 55) + (sizeSquared * 25 / 1.35)),
    y: (window.innerHeight/2 - ((Math.floor(i/sizeSquared)) * 55) + (sizeSquared * 25 / 1.2)),
    width: 50,
    height: 50,
    fill: '#FFFFE8',
    shadowBlur: 5,
    counter: 0,
  }));
}

function generateText(){
  return [{  
    id: 'vertLine',
    x: (window.innerWidth/12.5),
    y: 15,
    offsetX: 0,
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
    x: (window.innerWidth/2.5),
    y: 15,
    offsetX: 0,
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
    x: (window.innerWidth/1.3),
    y: 15,
    offsetX: 0,
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

const App = () => {
  const [rectangles, setRectangles] = React.useState(INITIAL_STATE_RECT);
  const [textOptions, setTextOptions] = React.useState(INITIAL_STATE_TEXT);
  
  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  
  const handleClick = async (e) => {
    const id = e.target.id();
    
    if(colorMod === 'normal') {
      console.log(id);
      setRectangles(
        rectangles.map((rectangle) => {
          if((rectangle.id) === id) {
            return {
              ...rectangle,
              fill: colorArray[(rectangle.counter%colorArray.length)],
              counter: (rectangle.counter + 1),
            };
            
          } else { 
            return { ...rectangle };
          }
        })
      );
    } else if(colorMod === 'vertLine') {
      setRectangles(
        rectangles.map((rectangle) => {
          if((rectangle.id%SIZE_SQUARED) === id%SIZE_SQUARED) {
            return {
              ...rectangle,
              fill: colorArray[(rectangle.counter%colorArray.length)],
              counter: (rectangle.counter + 1),
            };
            
          } else { 
            return { ...rectangle };
          }
        })
      );
    } else if(colorMod === 'horizonLine') {
      setRectangles(
        rectangles.map((rectangle) => {
          if(Math.floor(rectangle.id/SIZE_SQUARED) === Math.floor(id/SIZE_SQUARED)) {
            return {
              ...rectangle,
              fill: colorArray[(rectangle.counter%colorArray.length)],
              counter: (rectangle.counter + 1),
            };
            
          } else { 
            return { ...rectangle };
          }
        })
      );
    } else if(colorMod === 'spiral') {
      console.log(id);
      let rectangleIndex = Number.parseInt(id,10);
      let stepCounter = 1;
      let timesToIterateCounter = 1;
        
      //stop when out of index, dont have to worry about out of bounds
      while(rectangleIndex >= 0 && rectangleIndex < rectangles.length){ 
        
        //repeat as many times as needed
        for(let repeats = 0; repeats < timesToIterateCounter; repeats++){
          console.log('rectangle index starting for loop', rectangleIndex);
          //find index in array, 'click it'
          setRectangles(
            rectangles.map((rectangle) => {
              if((Number.parseInt(rectangle.id,10)) === rectangleIndex) {
                return {
                  ...rectangle,
                  fill: colorArray[(rectangle.counter%colorArray.length)],
                  counter: (rectangle.counter + 1),
                };
                
              } else { 
                return { ...rectangle };
              }
            })
          );
          
          await delay(100);
          //move index the correct way based on what step
          switch(stepCounter%4){
            case 1:  
              rectangleIndex = rectangleIndex + SIZE_SQUARED; //up
              break;
            case 2:  
              rectangleIndex = rectangleIndex - 1; //right
              break;
            case 3:  
              rectangleIndex = rectangleIndex - SIZE_SQUARED; //down
              break;
            default: 
              rectangleIndex = rectangleIndex + 1; //left
              break;
          }
        }
        //console.log('rectangle index after switch', rectangleIndex);
        
        //count the step
        stepCounter+=1;
        
        //every 2 steps, add 1 repeat to cycle done
        if(stepCounter/2 > timesToIterateCounter){
          timesToIterateCounter += 1;
        }
      }
      
    }
    
    //console.log('rectangle clicked at index', id);
    //console.log('rectangles', rectangles);
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
          
        } else { //clicked other one, aka turn off selected for other options
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
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          key="toolbarBackground"
          id="toolbarBackground"
          x={0}
          y={0}
          width={window.innerWidth}
          height={window.innerHeight/20}
          fillLinearGradientStartPoint={{ x: window.innerWidth/5, y: 0 }}
          fillLinearGradientEndPoint={{ x: window.innerWidth, y: window.innerHeight/20 }}
          fillLinearGradientColorStops={[0, colorArray[0], 0.25, colorArray[1], 0.5, colorArray[2], 0.75, colorArray[3], 1, colorArray[4]]}
          shadowBlur={10}
          stroke="#5E6572"
        />
        {textOptions.map((text) => (
          <Text 
            x={text.x}
            y={text.y}
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
        {rectangles.map((rectangle) => (
          <Rect
            key={rectangle.id}
            id={rectangle.id}
            x={rectangle.x}
            y={rectangle.y}
            width={rectangle.width}
            height={rectangle.height}
            fill={rectangle.fill}
            shadowBlur={rectangle.shadowBlur}
            onClick={handleClick}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default App;
