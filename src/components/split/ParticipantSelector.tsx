import React, { useState, useEffect } from 'react';
import { Participant } from '../../types/split';
import { dbHelpers } from '../../services/database';
import { generateId } from '../../utils/validation';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

interface ParticipantSelectorProps {
  selectedParticipants: Participant[];
  onChange: (participants: Participant[]) => void;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  selectedParticipants,
  onChange,
}) => {
  const [savedParticipants, setSavedParticipants] = useState<Participant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');

  useEffect(() => {
    loadSavedParticipants();
  }, []);

  const loadSavedParticipants = async () => {
    const participants = await dbHelpers.getAllParticipants();
    setSavedParticipants(participants);
  };

  const handleAddParticipant = async () => {
    if (!newName.trim()) {
      alert('請輸入參與者名稱');
      return;
    }

    const newParticipant: Participant = {
      id: generateId(),
      name: newName.trim(),
      contact: newContact.trim() || undefined,
    };

    // 保存到資料庫
    await dbHelpers.addParticipant(newParticipant);

    // 添加到已選擇列表
    onChange([...selectedParticipants, newParticipant]);

    // 重新載入常用參與者
    await loadSavedParticipants();

    // 重置表單
    setNewName('');
    setNewContact('');
    setShowAddModal(false);
  };

  const handleToggleParticipant = (participant: Participant) => {
    const isSelected = selectedParticipants.some((p) => p.id === participant.id);

    if (isSelected) {
      onChange(selectedParticipants.filter((p) => p.id !== participant.id));
    } else {
      onChange([...selectedParticipants, participant]);
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    onChange(selectedParticipants.filter((p) => p.id !== participantId));
  };

  const isSelected = (participantId: string) => {
    return selectedParticipants.some((p) => p.id === participantId);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        分帳參與者
      </label>

      {/* 已選擇的參與者 */}
      {selectedParticipants.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-sm"
            >
              <span>👤 {participant.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveParticipant(participant.id)}
                className="hover:text-primary-900 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 常用參與者快速選擇 */}
      {savedParticipants.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2">常用參與者</div>
          <div className="flex flex-wrap gap-2">
            {savedParticipants.map((participant) => (
              <button
                key={participant.id}
                type="button"
                onClick={() => handleToggleParticipant(participant)}
                className={`px-3 py-1.5 rounded-lg border-2 text-sm transition-all ${
                  isSelected(participant.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {participant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 新增參與者按鈕 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowAddModal(true)}
        fullWidth
      >
        ➕ 新增參與者
      </Button>

      {/* 新增參與者彈窗 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewName('');
          setNewContact('');
        }}
        title="新增參與者"
      >
        <div className="space-y-4">
          <Input
            label="名稱 *"
            placeholder="例如：小明、王大華"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="聯絡方式（選填）"
            placeholder="手機或 Email"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setNewName('');
                setNewContact('');
              }}
              fullWidth
            >
              取消
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAddParticipant}
              fullWidth
            >
              確定
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
