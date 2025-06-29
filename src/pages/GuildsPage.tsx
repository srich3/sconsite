import React, { useState } from 'react';
import { Users, Crown, Star, Shield, Sword, Search, Filter, ArrowRight, MapPin, Calendar, Plus, Loader2 } from 'lucide-react';

const GuildsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuild, setSelectedGuild] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    rank: 'all',
    recruitment: 'all'
  });

  const mockGuilds = [
    {
      id: 1,
      name: "Shadowbane Company",
      description: "Elite mercenaries specializing in dangerous contracts and shadowy operations.",
      type: "Combat",
      memberCount: 45,
      rank: "Platinum",
      leader: "Magnus Ironforge",
      established: "Founded 2 years ago",
      region: "The Northern Wastes",
      recruitmentStatus: "Open",
      requirements: "Level 5+, Combat Focus",
      badges: ["Dragon Slayer", "Dungeon Master", "Guild Wars Victor"],
      recentActivity: "Completed the Crimson Depths expedition",
      logo: "https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
    },
    {
      id: 2,
      name: "Seekers of Truth",
      description: "Scholars and researchers dedicated to uncovering ancient knowledge and mysteries.",
      type: "Exploration",
      memberCount: 32,
      rank: "Gold",
      leader: "Lyra Moonwhisper",
      established: "Founded 18 months ago",
      region: "The Scholarly Sanctum",
      recruitmentStatus: "Selective",
      requirements: "Intelligence focus, Research background",
      badges: ["Lore Master", "Ancient Secrets", "Knowledge Keeper"],
      recentActivity: "Discovered the Lost Library of Aethros",
      logo: "https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
    },
    {
      id: 3,
      name: "Order of the Silver Lance",
      description: "Noble paladins and clerics sworn to protect the innocent and uphold justice.",
      type: "Protection",
      memberCount: 28,
      rank: "Gold",
      leader: "Sir Gareth Lightbringer",
      established: "Founded 3 years ago",
      region: "The Sacred Citadel",
      recruitmentStatus: "Open",
      requirements: "Good alignment, Divine magic preferred",
      badges: ["Defender of Faith", "Light Bearer", "Sacred Vows"],
      recentActivity: "Protected the village of Millhaven from raiders",
      logo: "https://images.pexels.com/photos/1181269/pexels-photo-1181269.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
    },
    {
      id: 4,
      name: "The Wild Hunt",
      description: "Rangers, druids, and beast masters who protect the natural world from corruption.",
      type: "Nature",
      memberCount: 21,
      rank: "Silver",
      leader: "Theron Wildstrike",
      established: "Founded 1 year ago",
      region: "The Whispering Woods",
      recruitmentStatus: "Open",
      requirements: "Nature connection, Outdoor survival skills",
      badges: ["Beast Friend", "Forest Guardian", "Natural Balance"],
      recentActivity: "Cleansed the Corrupted Grove",
      logo: "https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
    }
  ];

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Platinum': return 'text-cyan-400 bg-cyan-400/20';
      case 'Gold': return 'text-yellow-400 bg-yellow-400/20';
      case 'Silver': return 'text-gray-300 bg-gray-300/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getRecruitmentColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-emerald-400 bg-emerald-400/20';
      case 'Selective': return 'text-yellow-400 bg-yellow-400/20';
      case 'Closed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const filteredGuilds = mockGuilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guild.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guild.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || guild.type.toLowerCase() === filters.type.toLowerCase();
    const matchesRank = filters.rank === 'all' || guild.rank.toLowerCase() === filters.rank.toLowerCase();
    const matchesRecruitment = filters.recruitment === 'all' || guild.recruitmentStatus.toLowerCase() === filters.recruitment.toLowerCase();

    return matchesSearch && matchesType && matchesRank && matchesRecruitment;
  });

  const handleApplyToGuild = (guildId: number) => {
    const guild = mockGuilds.find(g => g.id === guildId);
    if (guild) {
      alert(`Application submitted to ${guild.name}! You will be notified when the guild leader reviews your application.`);
    }
  };

  const handleContactLeader = (guildId: number) => {
    const guild = mockGuilds.find(g => g.id === guildId);
    if (guild) {
      alert(`Contacting ${guild.leader} from ${guild.name}. This feature will be implemented in the messaging system.`);
    }
  };

  const handleCreateGuild = () => {
    alert('Guild creation form will be implemented. This will allow you to create your own guild with custom settings, requirements, and description.');
    setShowCreateGuild(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Users className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h1 className="font-fantasy text-4xl md:text-6xl font-bold text-white mb-6">
            Guild Directory
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join a guild to find like-minded adventurers, participate in exclusive events, 
            and earn prestigious badges and rewards.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guilds by name, description, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-fantasy-900/30 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-6 py-3 bg-fantasy-700 hover:bg-fantasy-600 text-white rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
          <button 
            onClick={() => setShowCreateGuild(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-midnight-900 font-bold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Guild</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-fantasy-900/30 border border-fantasy-700/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Filter Guilds</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 bg-fantasy-800/50 border border-fantasy-700/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all">All Types</option>
                  <option value="combat">Combat</option>
                  <option value="exploration">Exploration</option>
                  <option value="protection">Protection</option>
                  <option value="nature">Nature</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Rank</label>
                <select
                  value={filters.rank}
                  onChange={(e) => setFilters(prev => ({ ...prev, rank: e.target.value }))}
                  className="w-full p-2 bg-fantasy-800/50 border border-fantasy-700/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all">All Ranks</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Recruitment</label>
                <select
                  value={filters.recruitment}
                  onChange={(e) => setFilters(prev => ({ ...prev, recruitment: e.target.value }))}
                  className="w-full p-2 bg-fantasy-800/50 border border-fantasy-700/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="selective">Selective</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({ type: 'all', rank: 'all', recruitment: 'all' })}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Guild Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredGuilds.map((guild) => (
            <div
              key={guild.id}
              className={`bg-fantasy-900/30 border border-fantasy-700/30 rounded-xl p-6 hover:bg-fantasy-800/30 transition-all cursor-pointer ${
                selectedGuild === guild.id ? 'ring-2 ring-yellow-400' : ''
              }`}
              onClick={() => setSelectedGuild(guild.id === selectedGuild ? null : guild.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={guild.logo}
                    alt={guild.name}
                    className="w-16 h-16 rounded-full border-2 border-yellow-400"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{guild.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankColor(guild.rank)}`}>
                        {guild.rank}
                      </span>
                      <span className="text-gray-400 text-sm">{guild.type}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRecruitmentColor(guild.recruitmentStatus)}`}>
                  {guild.recruitmentStatus}
                </div>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">{guild.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">{guild.memberCount} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300 text-sm">{guild.leader}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">{guild.region}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300 text-sm">{guild.established}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {guild.badges.slice(0, 3).map((badge, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-fantasy-700/50 text-yellow-400 text-xs rounded-full flex items-center space-x-1"
                  >
                    <Star className="w-3 h-3" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  Recent: {guild.recentActivity}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGuild(guild.id === selectedGuild ? null : guild.id);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-midnight-900 font-medium rounded-lg transition-all transform hover:scale-105"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredGuilds.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Guilds Found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ type: 'all', rank: 'all', recruitment: 'all' });
              }}
              className="px-6 py-2 bg-fantasy-700 hover:bg-fantasy-600 text-white rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Guild Details Panel */}
        {selectedGuild && (
          <div className="bg-fantasy-900/30 border border-fantasy-700/30 rounded-xl p-6">
            {(() => {
              const guild = mockGuilds.find(g => g.id === selectedGuild);
              if (!guild) return null;
              
              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Guild Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-4 mb-6">
                      <img
                        src={guild.logo}
                        alt={guild.name}
                        className="w-20 h-20 rounded-full border-2 border-yellow-400"
                      />
                      <div>
                        <h2 className="font-fantasy text-3xl font-bold text-white mb-2">
                          {guild.name}
                        </h2>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRankColor(guild.rank)}`}>
                            {guild.rank} Guild
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecruitmentColor(guild.recruitmentStatus)}`}>
                            {guild.recruitmentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      {guild.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-white font-semibold mb-3">Guild Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Crown className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">Leader: {guild.leader}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">{guild.memberCount} active members</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">{guild.region}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">{guild.established}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-3">Requirements</h4>
                        <p className="text-gray-300 mb-4">{guild.requirements}</p>
                        <h4 className="text-white font-semibold mb-3">Recent Activity</h4>
                        <p className="text-gray-300">{guild.recentActivity}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Guild Badges</h4>
                      <div className="flex flex-wrap gap-3">
                        {guild.badges.map((badge, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 px-3 py-2 bg-fantasy-700/50 border border-yellow-400/30 rounded-lg"
                          >
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">{badge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="bg-fantasy-800/30 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Join This Guild</h3>
                      
                      {guild.recruitmentStatus === 'Open' ? (
                        <>
                          <p className="text-gray-300 mb-4">
                            This guild is currently accepting new members.
                          </p>
                          <button 
                            onClick={() => handleApplyToGuild(guild.id)}
                            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 mb-3"
                          >
                            Apply Now
                          </button>
                        </>
                      ) : guild.recruitmentStatus === 'Selective' ? (
                        <>
                          <p className="text-gray-300 mb-4">
                            This guild reviews applications carefully. Make sure you meet their requirements.
                          </p>
                          <button 
                            onClick={() => handleApplyToGuild(guild.id)}
                            className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 mb-3"
                          >
                            Submit Application
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 mb-4">
                            This guild is not currently accepting new members.
                          </p>
                          <button
                            disabled
                            className="w-full px-4 py-3 bg-gray-600 text-gray-400 font-bold rounded-lg cursor-not-allowed mb-3"
                          >
                            Recruitment Closed
                          </button>
                        </>
                      )}

                      <button 
                        onClick={() => handleContactLeader(guild.id)}
                        className="w-full px-4 py-3 bg-fantasy-700 hover:bg-fantasy-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Contact Guild Leader
                      </button>
                    </div>

                    <div className="mt-6 bg-fantasy-800/30 rounded-lg p-6">
                      <h4 className="text-white font-semibold mb-3">Guild Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Active Members</span>
                          <span className="text-white font-medium">{guild.memberCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Guild Rank</span>
                          <span className="text-white font-medium">{guild.rank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Specialization</span>
                          <span className="text-white font-medium">{guild.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Badges Earned</span>
                          <span className="text-white font-medium">{guild.badges.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Create Guild Modal */}
        {showCreateGuild && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-fantasy-900 border border-fantasy-700 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Create New Guild</h3>
              <p className="text-gray-300 mb-6">
                Guild creation feature is coming soon! This will allow you to create your own guild with custom settings, requirements, and description.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateGuild(false)}
                  className="flex-1 px-4 py-2 bg-fantasy-700 hover:bg-fantasy-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGuild}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-midnight-900 font-bold rounded-lg transition-colors"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Guild CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-fantasy-800/30 to-midnight-800/30 rounded-2xl p-8">
          <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="font-fantasy text-2xl font-bold text-white mb-4">
            Start Your Own Guild
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Ready to lead? Create your own guild and build a community of adventurers 
            who share your vision and playstyle.
          </p>
          <button 
            onClick={() => setShowCreateGuild(true)}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-midnight-900 font-bold rounded-lg transition-all transform hover:scale-105"
          >
            Create Guild
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuildsPage;