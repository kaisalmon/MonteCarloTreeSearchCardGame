import {Card} from "../cardgame/Card";
import React, {CSSProperties} from "react";
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";
import bg from './assets/bg.png'
import CardGame, {CardGameChoiceMove, CardGameState} from "../cardgame/CardGame";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import TransitionProps from "./TransitionProps";
import {ChooseAPlayer} from "../cardgame/Components/ChoiceActions/ChooseAPlayer";
import {EXTREMES} from "../cardgame/Components/Effects/MoveDemographicEffect";
import {ChooseAnExtreme, ID_BY_EXTREME} from "../cardgame/Components/ChoiceActions/ChooseAnExtreme"; // for React DOM

type DemographicDisplayProps = {
    gamestate: CardGameState,
    game: CardGame,
    onChoiceClick: (move:CardGameChoiceMove)=>void,
}

const COMPASS_STYLE:CSSProperties = {
    height: 500,
    width: 500,
    border: '1px solid black',
    position: 'relative',
    margin: 10,
    overflow: 'hidden'
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
float distSquared( vec2 A, vec2 B )
{
    vec2 C = A - B;
    return dot( C, C );
}

void main() {
  vec2 bluePos = vec2(blueX, 1.0-blueY);
  vec2 redPos = vec2(redX, 1.0-redY);
  float blueScore = bluePop/400.0 - distSquared(bluePos, uv);
  float redScore = redPop/400.0 - distSquared(redPos, uv);
  float blueWins = blueScore > 0.0 && blueScore > redScore ? 1.0 : 0.0;
  float redWins = redScore > 0.0 && blueScore < redScore ? 1.0 : 0.0;
  float noWins = (1.0-redWins)*(1.0-blueWins);
  
  vec3 redColor = vec3(0.8,0.1,0.1);
  vec3 blueColor = vec3(0.15,0.15,0.8);
  vec3 grayColor = vec3(.7,0.7,0.7);
  
  vec3 col = redColor * redWins + blueColor * blueWins + grayColor * noWins;
  
  gl_FragColor = vec4(col, 1.0);
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
}

const Background = (props:BackgroundProps) => {
    const { blueX, redPop, redX, bluePop, blueY, redY } = props;
    return <>
        <img src={bg} style={{position:'absolute'}}/>
        <Surface width={500} height={500} style={{mixBlendMode:'multiply'}}>
        <Node shader={shaders.helloBlue} uniforms={{
            blueX:blueX/2 + 0.5,
            blueY:blueY/2 + 0.5,
            bluePop:bluePop,
            redX:redX/2 + 0.5,
            redY:redY/2 + 0.5,
            redPop:redPop,
        }} />
    </Surface>
    </>
  }

class AnimatedBackground extends React.Component<BackgroundProps> {
  render() {
   return  <TransitionProps
       component={Background}
       propList={['blueX', 'blueY', 'bluePop', 'redX', 'redY', 'redPop']}
       blueX={this.props.blueX}
       blueY={this.props.blueY}
       bluePop={this.props.bluePop}
       redX={this.props.redX}
       redY={this.props.redY}
       redPop={this.props.redPop}
   />
  }
}

type VoteBarsProps = {
    redVotes: number,
    blueVotes:number,
}
const VoteBars = ({redVotes, blueVotes}:VoteBarsProps)=><div style={{display: 'flex', width: 200}}>
    <div style={{flexGrow:blueVotes, background:'blue', ...VOTES_BAR_STYLE}}>{Math.round(blueVotes)}</div>
    <div style={{flexGrow:redVotes, background:'red', ...VOTES_BAR_STYLE}}>{Math.round(redVotes)}</div>
</div>

const DemographicDisplay:React.FunctionComponent<DemographicDisplayProps> = props=>{
    const {gamestate:{playerOne, playerTwo}, onChoiceClick, game} = props;
    const votes = props.game.getVotes(props.gamestate);
    const isChoosingPlayer = game.getActiveActionChoice(props.gamestate)?.constructor === ChooseAPlayer;
    const isChoosingExtreme = game.getActiveActionChoice(props.gamestate)?.constructor === ChooseAnExtreme;
    return <div style={{display:'flex', justifyContent:'space-evenly'}}>
            <div style={COMPASS_STYLE}>
            <AnimatedBackground
                bluePop={playerOne.popularity}
                blueX={playerOne.position.x}
                blueY={playerOne.position.y}
                redPop={playerTwo.popularity}
                redX={playerTwo.position.x}
                redY={playerTwo.position.y}
            />
            <div
                className={isChoosingPlayer ? 'glow' : ''}
                style={{...PLAYER_STYLE, background:'blue', transform:coordsToTransform(props.gamestate.playerOne.position)}}
                onClick={()=>isChoosingPlayer && onChoiceClick({type:'choice', choice:1})}
            />
            <div
                className={isChoosingPlayer ? 'glow' : ''}
                style={{...PLAYER_STYLE, background:'red', transform:coordsToTransform(props.gamestate.playerTwo.position)}}
                onClick={()=>isChoosingPlayer && onChoiceClick({type:'choice', choice:2})}
            />
            {props.gamestate.demographics.map(({x,y}, i)=>{
                const vote = props.game.getDemographicVote(props.gamestate, {x,y})
                const background = vote === 1 ? 'blue' :
                                    vote ===2 ? 'red' :
                                        'gray';
                const positionStyling:CSSProperties = {
                    transform: coordsToTransform({x,y}),
                    background
                }
                return <div style={{...DEMOGRAPHIC_STYLE, ...positionStyling}} key={i}/>
            })}
            {isChoosingExtreme && Object.entries(EXTREMES).map(([extreme, point])=>
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
            </div>
    </div>
}

export default DemographicDisplay;