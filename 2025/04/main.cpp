#include <iostream>
#include <fstream>
#include <string>
#include <vector>

int main() {
    std::ifstream input("input.txt");
    std::vector<std::string> grid;
    std::string line;
    
    while (std::getline(input, line)) {
        grid.push_back(line);
    }
    
    int rows = grid.size();
    int cols = grid[0].size();
    
    // Part 1
    int accessible = 0;
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            if (grid[i][j] == '@') {
                int adjacent_count = 0;
                
                for (int di = -1; di <= 1; di++) {
                    for (int dj = -1; dj <= 1; dj++) {
                        if (di == 0 && dj == 0) continue;
                        
                        int ni = i + di;
                        int nj = j + dj;
                        
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                            if (grid[ni][nj] == '@') {
                                adjacent_count++;
                            }
                        }
                    }
                }
                
                if (adjacent_count < 4) {
                    accessible++;
                }
            }
        }
    }
    
    std::cout << "Part 1: " << accessible << std::endl;
    
    // Part 2: repeatedly remove accessible rolls
    int total_removed = 0;
    
    while (true) {
        std::vector<std::pair<int, int>> to_remove;
        
        // find all currently accessible rolls
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == '@') {
                    int adjacent_count = 0;
                    
                    for (int di = -1; di <= 1; di++) {
                        for (int dj = -1; dj <= 1; dj++) {
                            if (di == 0 && dj == 0) continue;
                            
                            int ni = i + di;
                            int nj = j + dj;
                            
                            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                                if (grid[ni][nj] == '@') {
                                    adjacent_count++;
                                }
                            }
                        }
                    }
                    
                    if (adjacent_count < 4) {
                        to_remove.push_back({i, j});
                    }
                }
            }
        }
        
        // if no rolls are accessible, we're done
        if (to_remove.empty()) {
            break;
        }
        
        // remove all accessible rolls
        for (auto [i, j] : to_remove) {
            grid[i][j] = '.';
            total_removed++;
        }
    }
    
    std::cout << "Part 2: " << total_removed << std::endl;
    
    return 0;
}
