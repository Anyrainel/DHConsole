import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RecommendIcon from '@mui/icons-material/Recommend';
import { Character } from '../../api/CharacterInfo';
import CommandService from '../../api/CommandService';
import RecommendationService from '../../api/RecommendationService';
import GameData from '../../store/gameData';
import { useLanguageContext } from '../../store/languageContext';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../store/SnackbarContext';

interface LightConeSectionProps {
    characterId: number;
    characterInfo: Character;
    onUpdate: () => void;
}

export default function LightConeSection({ characterId, characterInfo, onUpdate }: LightConeSectionProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [equipId, setEquipId] = React.useState<number | null>(characterInfo.equipId || null);
    const [equipLevel, setEquipLevel] = React.useState(characterInfo.equipLevel || 1);
    const [equipRank, setEquipRank] = React.useState(characterInfo.equipRank || 1);
    const [canRecommend, setCanRecommend] = React.useState(false);
    
    const { language } = useLanguageContext();
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        setEquipId(characterInfo.equipId || null);
        setEquipLevel(characterInfo.equipLevel || 1);
        setEquipRank(characterInfo.equipRank || 1);
        setIsEditing(false);
    }, [characterInfo]);

    React.useEffect(() => {
        let isMounted = true;
        setCanRecommend(false); // Reset immediately on id change
        
        RecommendationService.getLightConeRecommendation(characterId)
            .then(recId => {
                if (isMounted && recId) {
                    setCanRecommend(true);
                }
            })
            .catch(err => console.error('Failed to check recommendation:', err));
            
        return () => { isMounted = false; };
    }, [characterId]);

    const handleSave = async () => {
        try {
            await CommandService.setCharacterEquip(characterId, equipId, equipLevel, equipRank);
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save light cone info:', error);
            showSnackbar(t('character.lightCone.errors.saveFailed'), 'error');
        }
    };

    const handleRecommend = async () => {
        try {
            setIsEditing(true);
            const targetId = await RecommendationService.getLightConeRecommendation(characterId);

            if (!targetId) {
                showSnackbar(t('character.lightCone.errors.recommendFailed'), 'warning');
                return;
            }

            setEquipId(targetId);
            setEquipLevel(80);
            setEquipRank(5);
            showSnackbar(t('character.lightCone.messages.recommendSuccess'), 'success');

        } catch (error) {
            console.error('Failed to recommend light cone:', error);
            showSnackbar(t('character.lightCone.errors.recommendFailed'), 'error');
        }
    };

    const allItemsForEquip = React.useMemo(() => {
        return Object.entries(GameData.getAllItems(language)).filter(([id]) => {
            const numId = Number(id);
            // Currently all equip are between 21000 and 25000. No items are between 25000 and 30000.
            // If game data changes, this will need to be updated.
            return numId >= 21000 && numId < 30000;
        });
    }, [language]);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    {t('character.lightCone.title')}
                </Typography>
                <IconButton size="small" onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                    <EditIcon />
                </IconButton>
                {canRecommend && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RecommendIcon />}
                        onClick={handleRecommend}
                        sx={{ ml: 1 }}
                    >
                        {t('character.lightCone.actions.recommend')}
                    </Button>
                )}
            </Box>

            {isEditing ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        select
                        label={t('character.lightCone.name')}
                        value={equipId === null ? '' : equipId}
                        onChange={(e) => setEquipId(e.target.value === '' ? null : Number(e.target.value))}
                        size="small"
                        sx={{ width: '300px' }}
                    >
                        <MenuItem value="">{t('character.lightCone.noLightCone')}</MenuItem>
                        {allItemsForEquip.map(([id, name]) => (
                            <MenuItem key={id} value={id}>
                                {name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label={t('character.lightCone.level')}
                        type="number"
                        value={equipLevel}
                        onChange={(e) => setEquipLevel(Number(e.target.value))}
                        inputProps={{ min: 1, max: 80 }}
                        size="small"
                        sx={{ width: '100px' }}
                    />
                    <TextField
                        label={t('character.lightCone.superimposition')}
                        type="number"
                        value={equipRank}
                        onChange={(e) => setEquipRank(Number(e.target.value))}
                        inputProps={{ min: 1, max: 5 }}
                        size="small"
                        sx={{ width: '100px' }}
                    />
                    <Button variant="contained" onClick={handleSave} size="small">
                        {t('save')}
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', paddingRight: 6 }}>
                    <Typography>
                            {t('character.lightCone.name')}: {characterInfo.equipId ? GameData.get(characterInfo.equipId, language) : '--'}
                    </Typography>
                        <Typography>
                            {t('character.lightCone.level')}: {characterInfo.equipLevel || '--'}
                        </Typography>
                        <Typography>
                            {t('character.lightCone.superimposition')}: {characterInfo.equipRank || '--'}
                        </Typography>
                </Box>
            )}
        </Box>
    );
} 