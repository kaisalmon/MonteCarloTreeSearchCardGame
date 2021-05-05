/******************************************************************************

                              Online C++ Compiler.
               Code, Compile, Run and Debug C++ program online.
Write your code in this editor and press "Run" button to compile and execute it.

*******************************************************************************/

#include <iostream>

using namespace std;

enum Tile { red, empty, blue };
enum Status { red_win, blue_win, draw, in_play };

const int SIZE = 6, GOAL_LEN=4;

class gamestate {
public:
    Tile board[SIZE][SIZE];
    bool blue_turn;
    
    gamestate():
        blue_turn{true},
        board{
            {empty, empty, empty, empty, empty, empty},
            {empty, empty, empty, empty, empty, empty},
            {empty, empty, empty, empty, empty, empty},
            {empty, empty, empty, empty, empty, empty},
            {empty, empty, empty, empty, empty, empty},
            {empty, empty, empty, empty, empty, empty}
        } {}
        
    Status getStatus(){
        for (int x = 0; x <= SIZE-GOAL_LEN; ++x) {
            for (int y = 0; y < SIZE; ++y) {
                if(this->board[x][y] == empty) continue;
                if(this->board[x][y] != this->board[x+1][y]) continue;
                if(this->board[x][y] != this->board[x+2][y]) continue;
                if(this->board[x][y] != this->board[x+3][y]) continue;
                return board[x][y] == blue ? blue_win : red_win; 
            }
        }
        for (int x = 0; x < SIZE; ++x) {
            for (int y = 0; y <= SIZE-GOAL_LEN; ++y) {
                if(this->board[x][y] == empty) continue;
                if(this->board[x][y] != this->board[x][y+1]) continue;
                if(this->board[x][y] != this->board[x][y+2]) continue;
                if(this->board[x][y] != this->board[x][y+3]) continue;
                return board[x][y] == blue ? blue_win : red_win; 
            }
        }
        for (int x = 0; x <= SIZE-GOAL_LEN; ++x) {
            for (int y = 0; y <= SIZE-GOAL_LEN+1; ++y) {
                if(this->board[x][y] == empty) continue;
                if(this->board[x][y] != this->board[x+1][y+1]) continue;
                if(this->board[x][y] != this->board[x+2][y+2]) continue;
                if(this->board[x][y] != this->board[x+3][y+3]) continue;
                return board[x][y] == blue ? blue_win : red_win; 
            }
        }
        for (int x = SIZE-1; x >= SIZE-GOAL_LEN; --x) {
            for (int y = 0; y < SIZE; ++y) {
                if(this->board[x][y] == empty) continue;
                if(this->board[x][y] != this->board[x-1][y+1]) continue;
                if(this->board[x][y] != this->board[x-2][y+2]) continue;
                if(this->board[x][y] != this->board[x-3][y+3]) continue;
                return board[x][y] == blue ? blue_win : red_win; 
            }
        }
        return in_play;
    }
    
    bool operator==(gamestate other){
        if(this->blue_turn != other.blue_turn) return false;
        for (int i = 0; i < SIZE; ++i) {
            for (int j = 0; j < SIZE; ++j) {
                if(this->board[i][j] != other.board[i][j]) return false;
            }
        }
        return true;
    }
    
    bool operator!=(gamestate other){
        return !(*this==other);
    }
};



int main()
{
    gamestate a, b;
    cout<<"Hello World "<< (a==b) << " ";
    a.board[1][4] = red;
    a.board[2][3] = red;
    a.board[3][2] = red;
    a.board[4][1] = red;
    cout<<(a==b)<<" "<<a.getStatus();

    return 0;
}
