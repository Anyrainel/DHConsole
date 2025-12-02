import * as React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Card,
    CardContent,
    TextField,
    Button,
    Stack,
    MenuItem,
    Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import RecommendIcon from '@mui/icons-material/Recommend';
import { Character, Relic, MAIN_AFFIXES, SUB_AFFIXES, RELIC_NAMES } from '../../api/CharacterInfo';
import CommandService from '../../api/CommandService';
import GameData from '../../store/gameData';
import { useLanguageContext } from '../../store/languageContext';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../store/SnackbarContext';

interface RelicSectionProps {
    characterId: number;
    characterInfo: Character;
    onUpdate: () => void;
}

interface RelicCardProps {
    pos: number;
    relic: Relic;
    isEditing: boolean;
    onRelicChange: (pos: number, relic: Relic) => void;
    characterId: number;
    onUpdate: () => void;
}

interface AffixRowProps {
    pos: number;
    label: string;
    affix: string;
    level: number;
    isEditable: boolean;
    isMain?: boolean;
    onAffixChange?: (affix: string) => void;
    onLevelChange?: (level: number) => void;
}

function AffixRow({
    pos,
    label,
    affix,
    level,
    isEditable,
    isMain,
    onAffixChange,
    onLevelChange
}: AffixRowProps) {
    const { t } = useTranslation();
    const possibleAffixes = isMain ? MAIN_AFFIXES[pos] : SUB_AFFIXES;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 32 }}>
            {isEditable ? (
                <TextField
                    select
                    size="small"
                    value={affix || ''}
                    onChange={(e) => onAffixChange?.(e.target.value)}
                    sx={{
                        flexGrow: 1,
                        '& .MuiInputBase-root': {
                            height: 32,
                        },
                        '& .MuiOutlinedInput-input': {
                            py: 0.5,
                        }
                    }}
                >
                    {possibleAffixes.map((name) => (
                        <MenuItem key={name} value={name} dense>
                            {t('affix.' + name) || name}
                        </MenuItem>
                    ))}
                </TextField>
            ) : (
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    [{label}] {t('affix.' + affix) || t('character.relic.labels.empty')}
                </Typography>
            )}
            {isEditable && !isMain ? (
                <TextField
                    type="number"
                    size="small"
                    value={level}
                    onChange={(e) => {
                        const newLevel = Math.max(1, Math.min(Number(e.target.value), 6));
                        onLevelChange?.(newLevel);
                    }}
                    inputProps={{ min: 0, max: 6 }}
                    sx={{
                        width: 60,
                        '& .MuiInputBase-root': {
                            height: 32,
                        },
                        '& .MuiOutlinedInput-input': {
                            py: 0.5,
                        }
                    }}
                />
            ) : (
                <Typography variant="body2" sx={{ width: 80, textAlign: 'right' }}>
                    {isMain ? `${t('character.relic.labels.level')} ` : `${t('character.relic.labels.plus')} `}{level}
                </Typography>
            )}
        </Box>
    );
}

function isValidRelic(relic: Relic): boolean {
    if (!relic.subAffixes || !relic.subAffixLevels) return false;

    // Check if we have valid sub affixes (non-empty)
    const validSubAffixes = relic.subAffixes.filter(affix => affix !== '');
    const correspondingLevels = relic.subAffixLevels.slice(0, validSubAffixes.length);

    // If we have valid affixes, we need proper levels
    if (validSubAffixes.length === 0) return false;

    // Check each level is between 1 and 5
    const hasValidLevels = correspondingLevels.every(level => level >= 1 && level <= 6);
    if (!hasValidLevels) return false;

    // Check total is either 8 or 9
    const totalLevels = correspondingLevels.reduce((sum, level) => sum + level, 0);
    return totalLevels === 8 || totalLevels === 9;
}

function RelicCard({ pos: index, relic, isEditing, onRelicChange, characterId, onUpdate }: RelicCardProps) {
    const { language } = useLanguageContext();
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const [mainAffix, setMainAffix] = React.useState<string>(relic.mainAffix || '');
    const [subAffixes, setSubAffixes] = React.useState<Array<{ name: string; level: number }>>([
        { name: relic.subAffixes?.[0] || '', level: relic.subAffixLevels?.[0] || 0 },
        { name: relic.subAffixes?.[1] || '', level: relic.subAffixLevels?.[1] || 0 },
        { name: relic.subAffixes?.[2] || '', level: relic.subAffixLevels?.[2] || 0 },
        { name: relic.subAffixes?.[3] || '', level: relic.subAffixLevels?.[3] || 0 },
    ]);

    React.useEffect(() => {
        setMainAffix(relic.mainAffix || '');
        setSubAffixes([
            { name: relic.subAffixes?.[0] || '', level: relic.subAffixLevels?.[0] || 0 },
            { name: relic.subAffixes?.[1] || '', level: relic.subAffixLevels?.[1] || 0 },
            { name: relic.subAffixes?.[2] || '', level: relic.subAffixLevels?.[2] || 0 },
            { name: relic.subAffixes?.[3] || '', level: relic.subAffixLevels?.[3] || 0 },
        ]);
    }, [relic]);

    const totalSubAffixLevels = subAffixes.reduce((sum, affix) => sum + affix.level, 0);
    const isValidTotal = totalSubAffixLevels === 8 || totalSubAffixLevels === 9;

    const handleSubAffixChange = (index: number, field: 'name' | 'level', value: string | number) => {
        const newSubAffixes = [...subAffixes];

        if (field === 'level') {
            const numValue = Math.max(1, Math.min(Number(value), 5));
            newSubAffixes[index] = { ...newSubAffixes[index], level: numValue };
        } else {
            newSubAffixes[index] = { ...newSubAffixes[index], name: value as string };
        }

        setSubAffixes(newSubAffixes);

        onRelicChange(index, {
            ...relic,
            subAffixes: newSubAffixes.map(a => a.name),
            subAffixLevels: newSubAffixes.map(a => a.level),
        });
    };

    const handleMainAffixChange = (value: string) => {
        setMainAffix(value);
        onRelicChange(index, {
            ...relic,
            mainAffix: value,
        });
    };

    const allItemsForIndex = React.useMemo(() => {
        return Object.entries(GameData.getAllItems(language)).filter(([id]) => {
            const numId = Number(id);
            // Assumes all gold relic starts with 6. If game data changes, this will need to be updated.
            return numId > 60000 && numId < 70000 && numId % 10 === index;
        });
    }, [language, index]);

    const handleSaveRelic = async () => {
        try {
            await CommandService.setCharacterRelic(characterId, index, {
                ...relic,
                mainAffix,
                subAffixes: subAffixes.map(a => a.name),
                subAffixLevels: subAffixes.map(a => a.level),
            });
            onUpdate();
            showSnackbar(t('character.relic.messages.saveSuccess'), 'success');
        } catch (error) {
            showSnackbar(t('character.relic.errors.saveFailed'), 'error');
        }
    };


    return (
        <Card variant="outlined">
            <CardContent sx={{ px: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {RELIC_NAMES[index]}
                </Typography>
                <Stack spacing={1}>
                    <TextField
                        select
                        size="small"
                        label={t('character.relic.title')}
                        value={relic.relicId || ''}
                        onChange={(e) => onRelicChange(index, { ...relic, relicId: Number(e.target.value) })}
                        disabled={!isEditing}
                        fullWidth
                        sx={{
                            '& .MuiInputBase-root': {
                                height: 40,
                            }
                        }}
                    >
                        {allItemsForIndex.map(([id, name]) => (
                            <MenuItem key={id} value={id}>
                                    {name}
                                </MenuItem>
                            ))}
                    </TextField>

                    <Divider sx={{ my: 0.5 }} />

                    <AffixRow
                        pos={index}
                        key={0}
                        label={t('character.relic.labels.main')}
                        affix={mainAffix}
                        level={relic.level || 15}
                        isEditable={isEditing && index > 2}
                        isMain={true}
                        onAffixChange={(name) => handleMainAffixChange(name)}
                    />

                    <Divider sx={{ my: 0.5 }} />

                    {subAffixes.map((subAffix, subIndex) => (
                        <AffixRow
                            pos={index}
                            key={subIndex}
                            label={t('character.relic.labels.sub')}
                            affix={subAffix.name}
                            level={subAffix.level}
                            isEditable={isEditing}
                            onAffixChange={(name) => handleSubAffixChange(subIndex, 'name', name)}
                            onLevelChange={(level) => handleSubAffixChange(subIndex, 'level', level)}
                        />
                    ))}

                    {isEditing && !isValidTotal && (
                        <Typography color="error" variant="caption">
                            {t('character.relic.errors.invalidLevels', { level: totalSubAffixLevels })}
                        </Typography>
                    )}
                </Stack>

                {isEditing && (
                    <Box sx={{ mt: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleSaveRelic}
                            size="small"
                            fullWidth
                            disabled={!isValidTotal}
                        >
                            {t('save')}
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default function RelicsSection({ characterId, characterInfo, onUpdate }: RelicSectionProps) {
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const [isEditing, setIsEditing] = React.useState(false);
    const [relics, setRelics] = React.useState<Record<number, Relic>>(characterInfo.relics || {});

    React.useEffect(() => {
        setIsEditing(false);
    }, [characterId]);

    React.useEffect(() => {
        if (!isEditing) {
            setRelics(characterInfo.relics || {});
        }
    }, [characterInfo, isEditing]);

    const handleRelicChange = (index: number, relic: Relic) => {
        setRelics(prev => ({ ...prev, [index]: relic }));
    };

    const handleSave = async () => {
        // Validate all relics before saving
        const invalidRelics = Object.values(relics).filter(relic => !isValidRelic(relic));

        if (invalidRelics.length > 0) {
            showSnackbar(t('character.relic.errors.invalidRelics'), 'error');
            return;
        }

        try {
            await CommandService.setCharacterRelics(characterId, relics);
            onUpdate();
            setIsEditing(false);
            showSnackbar(t('character.relic.messages.saveAllSuccess'), 'success');
        } catch (error) {
            console.error(t('character.relic.errors.saveFailed'), error);
            showSnackbar(t('character.relic.errors.saveFailed'), 'error');
        }
    };

    const handleRecommend = async () => {
        try {
            setIsEditing(true);
            const recommendedRelics = await CommandService.getCharacterRelicRecommend(characterId);
            setRelics(recommendedRelics);
            showSnackbar(t('character.relic.messages.recommendSuccess'), 'success');
        } catch (error) {
            console.error('Failed to get relic recommendations:', error);
            showSnackbar(t('character.relic.errors.recommendFailed'), 'error');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{t('character.relic.title')}</Typography>
                <IconButton size="small" onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                    {isEditing ? <CloseIcon /> : <EditIcon />}
                </IconButton>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RecommendIcon />}
                    onClick={handleRecommend}
                    sx={{ ml: 1 }}
                >
                    {t('character.relic.actions.recommend')}
                </Button>
            </Box>

            {isEditing && (
                <Box sx={{ mb: 2 }}>
                    <Button variant="contained" onClick={handleSave} fullWidth>
                        {t('character.relic.actions.saveAll')}
                    </Button>
                </Box>
            )}

            <Grid container spacing={2}>
                {Array.from([1, 2, 3, 4, 5, 6], (i) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                        <RelicCard
                            pos={i}
                            relic={relics[i] || {}}
                            isEditing={isEditing}
                            onRelicChange={handleRelicChange}
                            characterId={characterId}
                            onUpdate={onUpdate}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}