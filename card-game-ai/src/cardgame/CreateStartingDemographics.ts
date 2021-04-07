import _ from 'lodash';

export function createStartingDemographics(): { x: number, y: number }[] {
    /*
    return new Array(500).fill(0).map(()=>({

        x: Math.random()*2-1,
        y: Math.random()*2-1,
    }))
    */
    const RAND_COUNT = 6;
    const randoms = new Array(RAND_COUNT).fill(0).map(()=>({
           x: Math.random()*0.9,
           y: Math.random()*0.9
       }))
   const eighth =  [
       {x: 0.2001, y:0},
         {x: 0.15, y: 0.15}, {x: 0.4, y: 0.1}, {x: 0.7, y: 0.1},
         {x:0.05, y:0.05}, {x:0.3, y:0.3}, {x:0.45, y:0.45}, {x:0.75, y:0.7},
         {x: 0, y: 0.9}, {x: 0.1, y: 0.9},
        {x: 0, y: 0},  {x: 0.4, y:0},
       ...randoms
      ]
   const quadrant=  flipAcrossDiagonal(eighth);
   const all = reflectAcrossBothAxes(quadrant);
   return mergeByDistance(all)
}

function flipAcrossDiagonal(eight: { x: number, y: number }[] ): { x: number, y: number }[] {
   return eight.flatMap(coord => ([
       coord,
      {x:coord.y, y:coord.x}
   ]));

}
function reflectAcrossBothAxes(quadrant: { x: number, y: number }[] ): { x: number, y: number }[] {
   return quadrant.flatMap(coord => ([
       coord,
      {x: -1 *coord.x, y: coord.y},
      {x: coord.x, y: -1 *coord.y},
      {x: -1 *coord.x, y: -1 *coord.y}
   ]));
}

function mergeByDistance(points: { x: number, y: number }[], thresholdSquared=0.005 ): { x: number, y: number }[] {
    const pointGroups:{ x: number, y: number }[][] = []
    for(let point of points){
        let putInGroup = false;
        for(let group of pointGroups){
            const [other] = group;
            const dx = other.x - point.x;
            const dy = other.y - point.y;
            const distSquared = dx*dx + dy*dy;
            if(distSquared < thresholdSquared){
               group.push(point);
               putInGroup = true;
               break;
            }
        }
        if(!putInGroup){
            pointGroups.push([point]);
        }
    }
    return pointGroups.map(group => group.map(({x,y})=>({x:x/group.length,y:y/group.length})).reduce((a,b)=>({
        x: a.x + b.x,
        y: a.y + b.y,
    })))
}