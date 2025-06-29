import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Upload, Download, Edit, Trash2, Shield, Sword, Star, Users } from 'lucide-react';

const CharacterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);

  const mockCharacters = [
    {
      id: 1,
      name: "Kaelin Shadowstrike",
      class: "Rogue",
      level: 8,
      guild: "Shadowbane Company",
      lastPlayed: "2 days ago",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop",
      status: "Active",
      achievements: 12,
      sessions: 24
    },
    {
      id: 2,
      name: "Lyralei Moonweaver",
      class: "Wizard",
      level: 6,
      guild: "Seekers of Truth",
      lastPlayed: "5 days ago",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop",
      status: "Active",
      achievements: 8,
      sessions: 18
    },
    {
      id: 3,
      name: "Thorin Ironbeard",
      class: "Champion",
      level: 4,
      guild: null,
      lastPlayed: "1 week ago",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop",
      status: "Inactive",
      achievements: 3,
      sessions: 7
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h1 className="font-fantasy text-4xl font-bold text-white mb-6">
            Character Management
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Please log in with Discord to access your characters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="font-fantasy text-4xl font-bold text-white mb-2">
              My Characters
            </h1>
            <p className="text-gray-300">
              Manage your Pathfinder 2e characters and FoundryVTT files
            </p>
          </div>
          <button className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-midnight-900 font-bold rounded-lg transition-all transform hover:scale-105">
            <Plus className="w-5 h-5" />
            <span>Create Character</span>
          </button>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockCharacters.map((character) => (
            <div
              key={character.id}
              className={`bg-fantasy-900/30 border border-fantasy-700/30 rounded-xl p-6 hover:bg-fantasy-800/30 transition-all cursor-pointer ${
                selectedCharacter === character.id ? 'ring-2 ring-yellow-400' : ''
              }`}
              onClick={() => setSelectedCharacter(character.id === selectedCharacter ? null : character.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-16 h-16 rounded-full border-2 border-yellow-400"
                />
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  character.status === 'Active' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {character.status}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
              <p className="text-fantasy-300 mb-2">Level {character.level} {character.class}</p>
              
              {character.guild && (
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm">{character.guild}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{character.achievements} achievements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sword className="w-4 h-4 text-red-400" />
                  <span className="text-gray-300">{character.sessions} sessions</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">Last played: {character.lastPlayed}</p>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-fantasy-700 hover:bg-fantasy-600 text-white rounded-md transition-colors text-sm flex items-center justify-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Character Card */}
          <div className="bg-fantasy-900/20 border-2 border-dashed border-fantasy-700/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] hover:border-yellow-400/50 transition-colors cursor-pointer">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Create New Character</h3>
            <p className="text-gray-500 text-center text-sm">
              Start your adventure with a new hero
            </p>
          </div>
        </div>

        {/* Character Details Panel */}
        {selectedCharacter && (
          <div className="bg-fantasy-900/30 border border-fantasy-700/30 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Character Info */}
              <div className="lg:w-1/3">
                <h2 className="font-fantasy text-2xl font-bold text-white mb-4">
                  {mockCharacters.find(c => c.id === selectedCharacter)?.name}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Class & Level</label>
                    <p className="text-white">
                      Level {mockCharacters.find(c => c.id === selectedCharacter)?.level}{' '}
                      {mockCharacters.find(c => c.id === selectedCharacter)?.class}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Guild</label>
                    <p className="text-white">
                      {mockCharacters.find(c => c.id === selectedCharacter)?.guild || 'No Guild'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Status</label>
                    <p className="text-white">
                      {mockCharacters.find(c => c.id === selectedCharacter)?.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Management */}
              <div className="lg:w-2/3">
                <h3 className="text-xl font-bold text-white mb-4">FoundryVTT Files</h3>
                <div className="border-2 border-dashed border-fantasy-700/50 rounded-lg p-8 text-center hover:border-yellow-400/50 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Upload your character's JSON file</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Drop your FoundryVTT character file here or click to browse
                  </p>
                  <button className="px-6 py-2 bg-fantasy-700 hover:bg-fantasy-600 text-white rounded-md transition-colors">
                    Choose File
                  </button>
                </div>

                {/* Recent Files */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Recent Files</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'kaelin-shadowstrike-v2.json', date: '2 days ago', size: '24 KB' },
                      { name: 'kaelin-shadowstrike-v1.json', date: '1 week ago', size: '22 KB' }
                    ].map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-fantasy-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-fantasy-600 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-white">JSON</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-gray-400 text-sm">{file.date} • {file.size}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 bg-fantasy-700 hover:bg-fantasy-600 text-white rounded transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterPage;