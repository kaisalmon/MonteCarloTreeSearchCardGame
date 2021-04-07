import {Card} from "../cardgame/Card";
import React, {CSSProperties} from "react";
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";
import bg from './assets/bg.png'
import CardGame, {CardGameChoiceMove, CardGameMove, CardGameState, POP_RANGE} from "../cardgame/CardGame";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import TransitionProps from "./TransitionProps";
import {ChooseAPlayer} from "../cardgame/Components/ChoiceActions/ChooseAPlayer";
import {EXTREMES} from "../cardgame/Components/Effects/MoveDemographicEffect";
import {ChooseAnExtreme, ID_BY_EXTREME} from "../cardgame/Components/ChoiceActions/ChooseAnExtreme";
import DelayHover from "./DelayHover";

type DemographicDisplayProps = {
    gamestate: CardGameState,
    game: CardGame,
    onChoiceClick: (move:CardGameChoiceMove)=>void,
    setPreview: (move?:CardGameMove)=>void;
    previewState?: CardGameState;
}

const COMPASS_STYLE:CSSProperties = {
    height: 500,
    width: 500,
    border: '1px solid black',
    position: 'relative',
    margin: 10,
    overflow: 'hidden',
    marginBottom: 160,
}
const PLAYER_STYLE:CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: '100%',
    border: '1px solid black',
    position: 'absolute',
    top: -15,
    left: -15,
    transition: 'background 0.3s, transform 0.3s'
}
const DEMOGRAPHIC_STYLE:CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: '20%',
    border: '1px solid black',
    position: 'absolute',
    top: -5,
    left: -5,
    transition: 'background 0.3s, transform 0.3s',
    pointerEvents:'none',
}

const VOTES_BAR_STYLE:CSSProperties = {
    border: '1px solid black',
    height: 25,
    overflow: 'hidden',
    color: 'white'
}

function coordsToTransform({x,y}:{x:number, y:number}){
    return `translate(${(x+1)*250}px,${(y+1)*250 }px)`;
}

const shaders = Shaders.create({
  helloBlue: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float bluePop;
uniform float blueX;
uniform float blueY;
uniform float redPop;
uniform float redX;
uniform float redY;
uniform float pbluePop;
uniform float pblueX;
uniform float pblueY;
uniform float predPop;
uniform float predX;
uniform float predY;
float distSquared( vec2 A, vec2 B )
{
    vec2 C = A - B;
    return dot( C, C );
}

void main() {
  vec2 bluePos = vec2(blueX, 1.0-blueY);
  vec2 redPos = vec2(redX, 1.0-redY);
  vec2 pBluePos = vec2(pblueX, 1.0-pblueY);
  vec2 pRedPos = vec2(predX, 1.0-predY);
  
  float blueScore = bluePop - distSquared(bluePos, uv);
  float redScore = redPop- distSquared(redPos, uv);
  float pBlueScore = pbluePop - distSquared(pBluePos, uv);
  float pRedScore = predPop - distSquared(pRedPos, uv);
  
  bool blueWins = blueScore > 0.0 && blueScore > redScore ;
  bool redWins = redScore > 0.0 && blueScore < redScore ;
  bool pBlueWins = pBlueScore > 0.0 && pBlueScore > pRedScore;
  bool pRedWins = pRedScore > 0.0 && pBlueScore < redScore ;
  
  bool noWins = !blueWins && !redWins && !pBlueWins && !pRedWins;
  
  vec3 redColor = vec3(0.8,0.1,0.1);
  vec3 blueColor = vec3(0.15,0.15,0.8);
  vec3 grayColor = vec3(.7,0.7,0.7);
  
  vec3 col = (redWins||pRedWins) && !pBlueWins ? redColor :
           (blueWins||pBlueWins) && !pRedWins  ? blueColor :
           grayColor;
    
  vec3 gains = (!redWins && pRedWins) || (!blueWins && pBlueWins) ? vec3(0.2) : vec3(0);
 vec3 losses = (redWins && !pRedWins) || (blueWins && !pBlueWins) ? vec3(0.2) : vec3(0);
  
  gl_FragColor = vec4(col + gains - losses , 1.0);
}`
  }
});

type BackgroundProps = {
    blueX: number,
    blueY:number,
    bluePop:number,
    redX:number,
    redY:number,
    redPop:number,
    pblueX: number,
    pblueY:number,
    pbluePop:number,
    predX:number,
    predY:number,
    predPop:number,
}

const Background = (props:BackgroundProps) => {
    const { blueX, redPop, redX, bluePop, blueY, redY,
    pblueX, predPop, predX, pbluePop, pblueY, predY} = props;
    const coef = POP_RANGE * 0.25;
    return <>
        <img src={bg} style={{position:'absolute'}}/>
        <Surface width={500} height={500} style={{mixBlendMode:'multiply'}}>
        <Node shader={shaders.helloBlue} uniforms={{
            blueX:blueX/2 + 0.5,
            blueY:blueY/2 + 0.5,
            bluePop:bluePop*coef,
            redX:redX/2 + 0.5,
            redY:redY/2 + 0.5,
            redPop:redPop*coef,
            pblueX:pblueX/2 + 0.5,
            pblueY:pblueY/2 + 0.5,
            pbluePop:pbluePop*coef,
            predX:predX/2 + 0.5,
            predY:predY/2 + 0.5,
            predPop:predPop*coef,
        }} />
    </Surface>
    </>
  }

class AnimatedBackground extends React.Component<BackgroundProps> {
  render() {
   return  <TransitionProps
       component={Background}
       propList={['blueX', 'blueY', 'bluePop', 'redX', 'redY', 'redPop', 'pblueX', 'pblueY', 'pbluePop', 'predX', 'predY', 'predPop']}
       blueX={this.props.blueX}
       blueY={this.props.blueY}
       bluePop={this.props.bluePop}
       redX={this.props.redX}
       redY={this.props.redY}
       redPop={this.props.redPop}
       pblueX={this.props.pblueX}
       pblueY={this.props.pblueY}
       pbluePop={this.props.pbluePop}
       predX={this.props.predX}
       predY={this.props.predY}
       predPop={this.props.predPop}
   />
  }
}

type VoteBarsProps = {
    redVotes: number,
    blueVotes:number,
    style?:CSSProperties,
}
const VoteBars = ({redVotes, blueVotes, style}:VoteBarsProps)=>
    <div style={{display: 'flex', width: 200, ...style}}>
        <div style={{flexGrow:blueVotes, background:'blue', ...VOTES_BAR_STYLE}}>{Math.round(blueVotes)}</div>
        <div style={{flexGrow:redVotes, background:'red', ...VOTES_BAR_STYLE}}>{Math.round(redVotes)}</div>
    </div>

const DemographicDisplay:React.FunctionComponent<DemographicDisplayProps> = props=>{
    const {gamestate:{playerOne, playerTwo},previewState, onChoiceClick, game} = props;
    const votes = props.game.getVotes(props.gamestate);
    const previewVotes = previewState ? props.game.getVotes(previewState) : votes;
    const isChoosingPlayer = game.getActiveActionChoice(props.gamestate)?.constructor === ChooseAPlayer;
    const isChoosingExtreme = game.getActiveActionChoice(props.gamestate)?.constructor === ChooseAnExtreme;

    const bluePlayer =
            <DelayHover
                delay={400}
                handleHoverTrigger={()=>{
                    if(isChoosingPlayer){
                        props.setPreview({type:'choice', choice:1})
                    }
                }}
                handleHoverCancel={()=>{
                    props.setPreview()
                }}
              >
                <div
                    className={isChoosingPlayer ? 'glow' : ''}
                    style={{...PLAYER_STYLE, background:'blue', transform:coordsToTransform(props.gamestate.playerOne.position)}}
                    onClick={()=>isChoosingPlayer && onChoiceClick({type:'choice', choice:1})}
                />
            </DelayHover>
    const redPlayer =
            <DelayHover
                delay={400}
                handleHoverTrigger={()=>{
                    if(isChoosingPlayer){
                        props.setPreview({type:'choice', choice:2})
                    }
                }}
                handleHoverCancel={()=>{
                    props.setPreview()
                }}
              >
                <div
                    className={isChoosingPlayer ? 'glow' : ''}
                    style={{...PLAYER_STYLE, background:'red', transform:coordsToTransform(props.gamestate.playerTwo.position)}}
                    onClick={()=>isChoosingPlayer && onChoiceClick({type:'choice', choice:2})}
                />
            </DelayHover>

    return <div style={{display:'flex', justifyContent:'space-evenly'}}>
            <div style={COMPASS_STYLE}>
            <AnimatedBackground
                bluePop={playerOne.popularity}
                blueX={playerOne.position.x}
                blueY={playerOne.position.y}
                redPop={playerTwo.popularity}
                redX={playerTwo.position.x}
                redY={playerTwo.position.y}
                pbluePop={props.previewState ? props.previewState.playerOne.popularity : playerOne.popularity}
                pblueX={props.previewState ? props.previewState.playerOne.position.x : playerOne.position.x}
                pblueY={props.previewState ? props.previewState.playerOne.position.y : playerOne.position.y}
                predPop={props.previewState ? props.previewState.playerTwo.popularity : playerTwo.popularity}
                predX={props.previewState ? props.previewState.playerTwo.position.x : playerTwo.position.x}
                predY={props.previewState ? props.previewState.playerTwo.position.y : playerTwo.position.y}
            />
                {bluePlayer}
                {redPlayer}
            {(['playerOne', 'playerTwo'] as ('playerOne'|'playerTwo')[]).map((playerKey)=><div
                style={{...PLAYER_STYLE,
                    borderColor:'white',
                    pointerEvents: 'none',
                    opacity: (props.previewState &&
                        (props.previewState[playerKey].position.x != props.gamestate[playerKey].position.x || props.previewState[playerKey].position.y != props.gamestate[playerKey].position.y)) ?
                        1 : 0,
                    transform:props.previewState ? coordsToTransform(props.previewState[playerKey].position) : coordsToTransform(props.gamestate[playerKey].position)
                }}
            />)}
            {props.gamestate.demographics.map(({x,y}, i)=>{
                const vote = props.game.getDemographicVote(props.gamestate, {x,y})
                const background = vote === 1 ? 'blue' :
                                    vote ===2 ? 'red' :
                                        'gray';
                const positionStyling:CSSProperties = {
                    transform: coordsToTransform({x,y}),
                    background
                }
                const preview = props.previewState?.demographics[i];
                const ghostStyling:CSSProperties = {
                    transform: preview ? coordsToTransform(preview) : positionStyling.transform,
                    opacity: preview && (preview.x !== x || preview.y !== y) ? .5 : 0,
                    borderColor:'white',
                    background
                }
                return <>
                     <div style={{...DEMOGRAPHIC_STYLE, ...positionStyling}} key={i}/>
                    <div style={{...DEMOGRAPHIC_STYLE,  ...ghostStyling}} key={`${i}_preview`}/>
                </>
            })}
            {isChoosingExtreme && Object.entries(EXTREMES).map(([extreme, point])=>
                 <DelayHover
                delay={400}
                handleHoverTrigger={()=>{
                    props.setPreview({type:'choice', choice:ID_BY_EXTREME[extreme]})
                }}
                handleHoverCancel={()=>{
                    props.setPreview()
                }}
              >
                <div
                    className={'glow'}
                    onClick={()=>onChoiceClick({type:'choice', choice:ID_BY_EXTREME[extreme]})}
                    style={{
                        position: "absolute",
                        backgroundColor: 'rgba(255, 128, 0, 0.5)',
                        top: -75,
                        left: -75,
                        width: 150,
                        height: 150,
                        borderRadius: 500,
                        transform:coordsToTransform(point)
                    }}
                />
                 </DelayHover>
            )}
        </div>
            <div style={{textAlign:'center'}}>
                Election in
                <div style={{fontSize:'150%', fontWeight:'bold'}}>
                    {props.gamestate.roundsUntilElection}
                </div>
                Rounds
                <div>
                    {props.gamestate.cardPlayedThisTurn ? 'Card has been Played this turn' : '-'}
                </div>
                <div>
                    {props.gamestate.endRoundAfterThisTurn ? 'Round will end if turn ended now' : '-'}
                </div>
                <TransitionProps
                    component={VoteBars}
                    propList={['blueVotes', 'redVotes']}
                    blueVotes={votes[1]||0}
                    redVotes={votes[2]||0}
                />
                <TransitionProps
                    style={{
                        opacity: previewState ? .4 : 0,
                        transition: 'opacity 0.4s'
                    }}
                    component={VoteBars}
                    propList={['blueVotes', 'redVotes']}
                    blueVotes={previewVotes[1]||0}
                    redVotes={previewVotes[2]||0}
                />
            </div>
    </div>
};

export default DemographicDisplay;