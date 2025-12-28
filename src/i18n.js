// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            title: "Interactive Guitar Fretboard",
            subtitle: {
                edit: "Click on notes to hide/show them",
                listen: "Listening mode: click on notes to hear their sound"
            },
            controls: {
                tuning: "Tuning",
                capo: "Capo",
                none: "None",
                fret: "Fret",
                key: "Key",
                select: "Select",
                reset: "Reset",
                harmonics: "Harmonics",
                on: "On",
                off: "Off",
                mode: "Mode",
                listening: "Listening",
                editing: "Editing",
                save: "Save PNG",
                addTuning: "Add Tuning",
                deleteTuning: "Delete Tuning"
            },
            tunings: {
                standard: "Standard",
                dropD: "Drop D",
                dropC: "Drop C",
                dadgad: "DADGAD",
                openG: "Open G",
                openD: "Open D",
                custom: "Custom"
            },
            keys: {
                allNotes: "All Notes",
                major: "major",
                minor: "minor"
            },
            circle: {
                title: "Circle of Fifths",
                outer: "Outer:",
                major: "major",
                inner: "Inner:",
                minor: "minor",
                hint: "Hover to preview, click to select",
                hintMobile: "Tap to select"
            },
            harmonics: {
                legend: "Harmonics Legend:",
                easy: "Easy (12, 24 frets) - octave higher",
                medium: "Medium (7, 19 frets) - octave + fifth",
                hard: "Hard (5 fret) - two octaves higher"
            },
            keyInfo: {
                displaying: "Displaying key:",
                clickToHear: "Click on notes to hear their sound.",
                clickToRestore: "Click on empty spaces on the fretboard to restore notes."
            },
            modal: {
                addTuning: {
                    title: "Add Custom Tuning",
                    current: "Current tuning (low to high):",
                    placeholder: "Tuning name...",
                    save: "Save",
                    cancel: "Cancel"
                }
            },
            mobile: {
                shortListening: "Listen",
                shortEditing: "Edit"
            }
        }
    },
    ru: {
        translation: {
            title: "Интерактивный гитарный гриф",
            subtitle: {
                edit: "Кликай по нотам чтобы скрыть/показать их",
                listen: "Режим прослушивания: кликай по нотам чтобы услышать их звук"
            },
            controls: {
                tuning: "Строй",
                capo: "Каподастр",
                none: "Нет",
                fret: "Лад",
                key: "Тональность",
                select: "Выбрать",
                reset: "Сбросить",
                harmonics: "Флажолеты",
                on: "Вкл",
                off: "Выкл",
                mode: "Режим",
                listening: "Прослушивание",
                editing: "Редактирование",
                save: "Сохранить PNG",
                addTuning: "Добавить строй",
                deleteTuning: "Удалить строй"
            },
            tunings: {
                standard: "Стандартный",
                dropD: "Drop D",
                dropC: "Drop C",
                dadgad: "DADGAD",
                openG: "Open G",
                openD: "Open D",
                custom: "Настраиваемый"
            },
            keys: {
                allNotes: "Все ноты",
                major: "мажор",
                minor: "минор"
            },
            circle: {
                title: "Кварто-квинтовый круг",
                outer: "Внешний:",
                major: "мажор",
                inner: "Внутренний:",
                minor: "минор",
                hint: "Наведи для предпросмотра, кликни для выбора",
                hintMobile: "Тап для выбора"
            },
            harmonics: {
                legend: "Легенда флажолетов:",
                easy: "Легко (12, 24 лады) - октава выше",
                medium: "Средне (7, 19 лады) - октава + квинта",
                hard: "Сложно (5 лад) - две октавы выше"
            },
            keyInfo: {
                displaying: "Отображается тональность:",
                clickToHear: "Кликай по нотам чтобы услышать их звук.",
                clickToRestore: "Кликай по пустым местам на грифе чтобы вернуть ноты."
            },
            modal: {
                addTuning: {
                    title: "Добавить свой строй",
                    current: "Текущий строй (от низкой к высокой):",
                    placeholder: "Название строя...",
                    save: "Сохранить",
                    cancel: "Отмена"
                }
            },
            mobile: {
                shortListening: "Слушать",
                shortEditing: "Править"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;