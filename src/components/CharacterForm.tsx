import React, { useState, useEffect } from 'react';
import { Save, X, Upload } from 'lucide-react';
import { Character } from '../types/database';
import { CharacterService } from '../services/characterService';
import { FileService } from '../services/fileService';

interface CharacterFormProps {
  character?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
  userId: string;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  onSave,
  onCancel,
  userId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    race: '',
    level: 1,
    background: '',
    alignment: '',
    backstory: '',
    notes: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const characterService = CharacterService.getInstance();
  const fileService = FileService.getInstance();

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        class: character.class,
        race: character.race,
        level: character.level,
        background: character.background || '',
        alignment: character.alignment || '',
        backstory: character.backstory || '',
        notes: character.notes || '',
        isActive: character.isActive
      });
    }
  }, [character]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await readFileAsText(file);
      const jsonData = JSON.parse(fileContent);
      
      // Parse FoundryVTT data
      const parsedData = characterService.parseFoundryData(jsonData);
      
      // Update form with parsed data
      setFormData(prev => ({
        ...prev,
        name: parsedData.name || prev.name,
        backstory: parsedData.backstory || prev.backstory,
        level: parsedData.stats?.level || prev.level
      }));

      setImportFile(file);
      alert('Character data imported successfully! Review and save to apply changes.');
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Failed to import file. Please ensure it\'s a valid FoundryVTT character JSON file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const characterData = {
        ...formData,
        userId,
        stats: {},
        equipment: []
      };

      let result;
      if (character?._id) {
        // Update existing character
        result = await characterService.updateCharacter(character._id, userId, characterData);
      } else {
        // Create new character
        result = await characterService.createCharacter(characterData);
      }

      if (result.success && result.data) {
        // If we have an import file, upload it and set as main
        if (importFile && result.data._id) {
          const uploadResult = await fileService.uploadFile(result.data._id, importFile);
          if (uploadResult.success && uploadResult.data) {
            await fileService.setMainFile(result.data._id, uploadResult.data.id);
          }
        }

        onSave(result.data);
      } else {
        alert(result.error || 'Failed to save character');
      }
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Failed to save character');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-fantasy-900 border border-fantasy-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {character ? 'Edit Character' : 'Create Character'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Import from FoundryVTT */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Import from FoundryVTT (Optional)
            </label>
            <label className="flex items-center space-x-2 p-3 border-2 border-dashed border-fantasy-700/50 rounded-lg hover:border-yellow-400/50 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">Choose FoundryVTT JSON file</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
            {importFile && (
              <p className="text-green-400 text-sm mt-2">
                ✓ Imported: {importFile.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Character Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter character name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Class *
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select a class</option>
                  <option value="Alchemist">Alchemist</option>
                  <option value="Barbarian">Barbarian</option>
                  <option value="Bard">Bard</option>
                  <option value="Champion">Champion</option>
                  <option value="Cleric">Cleric</option>
                  <option value="Druid">Druid</option>
                  <option value="Fighter">Fighter</option>
                  <option value="Gunslinger">Gunslinger</option>
                  <option value="Inventor">Inventor</option>
                  <option value="Investigator">Investigator</option>
                  <option value="Kineticist">Kineticist</option>
                  <option value="Magus">Magus</option>
                  <option value="Monk">Monk</option>
                  <option value="Oracle">Oracle</option>
                  <option value="Psychic">Psychic</option>
                  <option value="Ranger">Ranger</option>
                  <option value="Rogue">Rogue</option>
                  <option value="Sorcerer">Sorcerer</option>
                  <option value="Summoner">Summoner</option>
                  <option value="Swashbuckler">Swashbuckler</option>
                  <option value="Thaumaturge">Thaumaturge</option>
                  <option value="Witch">Witch</option>
                  <option value="Wizard">Wizard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Race *
                </label>
                <input
                  type="text"
                  name="race"
                  value={formData.race}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., Human, Elf, Dwarf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Level
                </label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Additional Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Background
                </label>
                <input
                  type="text"
                  name="background"
                  value={formData.background}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., Acolyte, Criminal, Noble"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Alignment
                </label>
                <select
                  name="alignment"
                  value={formData.alignment}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select alignment</option>
                  <option value="Lawful Good">Lawful Good</option>
                  <option value="Neutral Good">Neutral Good</option>
                  <option value="Chaotic Good">Chaotic Good</option>
                  <option value="Lawful Neutral">Lawful Neutral</option>
                  <option value="True Neutral">True Neutral</option>
                  <option value="Chaotic Neutral">Chaotic Neutral</option>
                  <option value="Lawful Evil">Lawful Evil</option>
                  <option value="Neutral Evil">Neutral Evil</option>
                  <option value="Chaotic Evil">Chaotic Evil</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="form-checkbox h-4 w-4 text-yellow-500 bg-fantasy-800 border-fantasy-600 rounded focus:ring-yellow-400"
                  />
                  <span className="text-gray-300">Active Character</span>
                </label>
              </div>
            </div>
          </div>

          {/* Backstory */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Backstory
            </label>
            <textarea
              name="backstory"
              value={formData.backstory}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Tell your character's story..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Additional notes about your character..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6 border-t border-fantasy-700/30">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-fantasy-600 text-gray-300 hover:text-white hover:border-fantasy-500 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-midnight-900 font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? 'Saving...' : 'Save Character'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterForm;