import React from 'react';
import { Trophy, Users } from 'lucide-react';

const RankingTable = ({ rankings }) => {
  if (!rankings || rankings.length === 0) return null;

  // Ensure rankings are sorted by score descending
  const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);

  return (
    <div className="glass-card animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-400" />
            Ranked Candidates
          </h2>
          <p className="text-gray-400 text-sm">Candidates sorted by their matching score</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="pb-4 pt-0 font-medium text-gray-400 text-sm">Rank</th>
              <th className="pb-4 pt-0 font-medium text-gray-400 text-sm">Candidate Name</th>
              <th className="pb-4 pt-0 font-medium text-gray-400 text-sm text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedRankings.map((candidate, index) => {
              const isTop = index === 0;
              return (
                <tr 
                  key={index} 
                  className={`
                    group transition-colors 
                    ${isTop ? 'bg-blue-500/5' : 'hover:bg-gray-800/30'}
                  `}
                >
                  <td className="py-4 font-medium text-gray-400">
                    <div className="flex items-center">
                      {isTop && <Trophy className="w-4 h-4 text-yellow-500 mr-2" />}
                      #{index + 1}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`font-semibold ${isTop ? 'text-blue-400' : 'text-gray-200'}`}>
                      {candidate.name}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-block px-3 py-1 rounded-full bg-gray-800 text-sm font-bold text-gray-300 border border-gray-700">
                      <span className={isTop ? 'text-blue-400' : ''}>{candidate.score}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;
