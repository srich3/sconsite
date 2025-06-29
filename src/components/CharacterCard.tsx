import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Download, Upload, Star, StarOff, Shield, Sword, Users, Calendar } from 'lucide-react';
import { Character } from '../types/database';
import { CharacterFile, FileService } from '../services/fileService';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
  onSelect: (character: Character) => void;
  isSelected: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onEdit,
  onDelete,
  onSelect,
  isSelected
}) => {
  const [files, setFiles] = useState<CharacterFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileService = FileService.getInstance();

  useEffect(() => {
    loadFiles();
  }, [character._id]);

  const loadFiles = async () => {
    if (character._id) {
      const characterFiles = await fileService.getCharacterFiles(character._id);
      setFiles(characterFiles);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !character._id) return;

    setIsUploading(true);
    try {
      const result = await fileService.uploadFile(character._id, file);
      if (result.success) {
        await loadFiles();
        // Reset the input
        event.target.value = '';
      } else {
        alert(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetMainFile = async (fileId: string) => {
    if (!character._id) return;

    const result = await fileService.setMainFile(character._id, fileId);
    if (result.success) {
      await loadFiles();
    } else {
      alert(result.error || 'Failed to set main file');
    }
  };

  const handleDownloadFile = (file: CharacterFile) => {
    fileService.downloadFile(file);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const result = await fileService.deleteFile(fileId);
      if (result.success) {
        await loadFiles();
      } else {
        alert(result.error || 'Failed to delete file');
      }
    }
  };

  const mainFile = files.find(file => file.isMain);
  const parsedData = mainFile?.fileData ? getCharacterDataFromJson(mainFile.fileData) : null;

  // Get character avatar from main file or use default
  const characterAvatar = parsedData?.avatar || character.stats?.avatar || 
    `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop`;

  return (
    <div
      className={`bg-fantasy-900/30 border border-fantasy-700/30 rounded-xl p-6 hover:bg-fantasy-800/30 transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-yellow-400' : ''
      }`}
      onClick={() => onSelect(character)}
    >
      <div className="flex items-center justify-between mb-4">
        <img
          src={characterAvatar}
          alt={character.name}
          className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover"
        />
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          character.isActive 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {character.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
      <p className="text-fantasy-300 mb-2">
        Level {parsedData?.level || character.level} {character.class}
      </p>
      
      {character.race && (
        <p className="text-gray-400 text-sm mb-3">{character.race}</p>
      )}

      {/* Character Details from JSON */}
      {parsedData && (
        <div className="mb-4 p-3 bg-fantasy-800/30 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">Character Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {parsedData.age && (
              <div>
                <span className="text-gray-400">Age:</span>
                <span className="text-white ml-1">{parsedData.age}</span>
              </div>
            )}
            {parsedData.height && (
              <div>
                <span className="text-gray-400">Height:</span>
                <span className="text-white ml-1">{parsedData.height}</span>
              </div>
            )}
            {parsedData.weight && (
              <div>
                <span className="text-gray-400">Weight:</span>
                <span className="text-white ml-1">{parsedData.weight}</span>
              </div>
            )}
            {parsedData.wealth !== undefined && (
              <div>
                <span className="text-gray-400">Wealth:</span>
                <span className="text-white ml-1">{parsedData.wealth} gp</span>
              </div>
            )}
          </div>
        </div>
      )}

      {character.guildId && (
        <div className="flex items-center space-x-2 mb-3">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">Guild Member</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-300">{files.length} files</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-gray-300">
            {character.createdAt ? new Date(character.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>

      {/* File Management */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">Files</h4>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="p-1 bg-yellow-500 hover:bg-yellow-400 text-midnight-900 rounded transition-colors">
              <Upload className="w-4 h-4" />
            </div>
          </label>
        </div>
        
        {files.length > 0 ? (
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-fantasy-700/30 rounded text-xs">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetMainFile(file.id);
                    }}
                    className={`p-1 rounded ${file.isMain ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                    title={file.isMain ? 'Main file' : 'Set as main file'}
                  >
                    {file.isMain ? <Star className="w-3 h-3 fill-current" /> : <StarOff className="w-3 h-3" />}
                  </button>
                  <span className="text-white truncate">{file.fileName}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFile(file);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-xs">No files uploaded</p>
        )}
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(character);
          }}
          className="flex-1 px-3 py-2 bg-fantasy-700 hover:bg-fantasy-600 text-white rounded-md transition-colors text-sm flex items-center justify-center space-x-1"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (character._id) onDelete(character._id);
          }}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Helper function to parse character data from FoundryVTT JSON
function getCharacterDataFromJson(jsonData: any) {
  try {
    const system = jsonData.system || {};
    const details = system.details || {};
    const biography = details.biography || {};
    const attributes = system.attributes || {};

    return {
      name: jsonData.name || '',
      appearance: biography.appearance || '',
      backstory: biography.backstory || '',
      age: details.age?.value || null,
      height: details.height?.value || '',
      weight: details.weight?.value || '',
      level: details.level?.value || 1,
      wealth: attributes.wealth?.value || 0,
      avatar: jsonData.img || ''
    };
  } catch (error) {
    console.error('Error parsing character JSON:', error);
    return null;
  }
}

export default CharacterCard;