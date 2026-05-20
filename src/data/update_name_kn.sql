-- UPDATE queries to populate name_kn (Kannada) values
-- Run this in pgAdmin after the ALTER TABLE statements have been applied.

BEGIN;

-- ── metadata_gotras ──────────────────────────────────────────────────────────
UPDATE public.metadata_gotras SET name_kn = 'ಅಗಸ್ತ್ಯ'      WHERE id = 'gotra-01';
UPDATE public.metadata_gotras SET name_kn = 'ಆಂಗಿರಸ'       WHERE id = 'gotra-02';
UPDATE public.metadata_gotras SET name_kn = 'ಅತ್ರಿ'         WHERE id = 'gotra-03';
UPDATE public.metadata_gotras SET name_kn = 'ಕಶ್ಯಪ'         WHERE id = 'gotra-04';
UPDATE public.metadata_gotras SET name_kn = 'ವಸಿಷ್ಠ'        WHERE id = 'gotra-05';
UPDATE public.metadata_gotras SET name_kn = 'ವಿಶ್ವಾಮಿತ್ರ'   WHERE id = 'gotra-06';
UPDATE public.metadata_gotras SET name_kn = 'ಭರದ್ವಾಜ'       WHERE id = 'gotra-07';
UPDATE public.metadata_gotras SET name_kn = 'ಜಮದಗ್ನಿ'       WHERE id = 'gotra-08';
UPDATE public.metadata_gotras SET name_kn = 'ಗೌತಮ'          WHERE id = 'gotra-09';
UPDATE public.metadata_gotras SET name_kn = 'ಆತ್ರೇಯ'        WHERE id = 'gotra-10';
UPDATE public.metadata_gotras SET name_kn = 'ಮುದ್ಗಲ'        WHERE id = 'gotra-11';
UPDATE public.metadata_gotras SET name_kn = 'ಶ್ರೀವತ್ಸ'       WHERE id = 'gotra-12';
UPDATE public.metadata_gotras SET name_kn = 'ಕೌಶಿಕ'         WHERE id = 'gotra-13';
UPDATE public.metadata_gotras SET name_kn = 'ಕೌಂಡಿನ್ಯ'      WHERE id = 'gotra-14';
UPDATE public.metadata_gotras SET name_kn = 'ಗಾರ್ಗ್ಯ'        WHERE id = 'gotra-15';
UPDATE public.metadata_gotras SET name_kn = 'ಶಾಂಡಿಲ್ಯ'      WHERE id = 'gotra-16';
UPDATE public.metadata_gotras SET name_kn = 'ಹಾರಿತ'         WHERE id = 'gotra-17';
UPDATE public.metadata_gotras SET name_kn = 'ಶೌನಕ'          WHERE id = 'gotra-18';
UPDATE public.metadata_gotras SET name_kn = 'ಪರಾಶರ'         WHERE id = 'gotra-19';
UPDATE public.metadata_gotras SET name_kn = 'ವಿಷ್ಣುವೃದ್ಧ'   WHERE id = 'gotra-20';

-- ── metadata_raashis ─────────────────────────────────────────────────────────
UPDATE public.metadata_raashis SET name_kn = 'ಮೇಷ'      WHERE id = 'raashi-01';
UPDATE public.metadata_raashis SET name_kn = 'ವೃಷಭ'     WHERE id = 'raashi-02';
UPDATE public.metadata_raashis SET name_kn = 'ಮಿಥುನ'    WHERE id = 'raashi-03';
UPDATE public.metadata_raashis SET name_kn = 'ಕರ್ಕಾಟಕ'  WHERE id = 'raashi-04';
UPDATE public.metadata_raashis SET name_kn = 'ಸಿಂಹ'     WHERE id = 'raashi-05';
UPDATE public.metadata_raashis SET name_kn = 'ಕನ್ಯಾ'    WHERE id = 'raashi-06';
UPDATE public.metadata_raashis SET name_kn = 'ತುಲಾ'     WHERE id = 'raashi-07';
UPDATE public.metadata_raashis SET name_kn = 'ವೃಶ್ಚಿಕ'  WHERE id = 'raashi-08';
UPDATE public.metadata_raashis SET name_kn = 'ಧನು'      WHERE id = 'raashi-09';
UPDATE public.metadata_raashis SET name_kn = 'ಮಕರ'      WHERE id = 'raashi-10';
UPDATE public.metadata_raashis SET name_kn = 'ಕುಂಭ'     WHERE id = 'raashi-11';
UPDATE public.metadata_raashis SET name_kn = 'ಮೀನ'      WHERE id = 'raashi-12';

-- ── metadata_nakshatras ───────────────────────────────────────────────────────
UPDATE public.metadata_nakshatras SET name_kn = 'ಅಶ್ವಿನಿ'          WHERE id = 'nakshatra-01';
UPDATE public.metadata_nakshatras SET name_kn = 'ಭರಣಿ'              WHERE id = 'nakshatra-02';
UPDATE public.metadata_nakshatras SET name_kn = 'ಕೃತ್ತಿಕಾ'          WHERE id = 'nakshatra-03';
UPDATE public.metadata_nakshatras SET name_kn = 'ರೋಹಿಣಿ'            WHERE id = 'nakshatra-04';
UPDATE public.metadata_nakshatras SET name_kn = 'ಮೃಗಶಿರ'            WHERE id = 'nakshatra-05';
UPDATE public.metadata_nakshatras SET name_kn = 'ಆರ್ದ್ರಾ'            WHERE id = 'nakshatra-06';
UPDATE public.metadata_nakshatras SET name_kn = 'ಪುನರ್ವಸು'          WHERE id = 'nakshatra-07';
UPDATE public.metadata_nakshatras SET name_kn = 'ಆಶ್ಲೇಷಾ'           WHERE id = 'nakshatra-08';
UPDATE public.metadata_nakshatras SET name_kn = 'ಪುಷ್ಯ'             WHERE id = 'nakshatra-09';
UPDATE public.metadata_nakshatras SET name_kn = 'ಮಘಾ'               WHERE id = 'nakshatra-10';
UPDATE public.metadata_nakshatras SET name_kn = 'ಪೂರ್ವ ಫಲ್ಗುಣಿ'    WHERE id = 'nakshatra-11';
UPDATE public.metadata_nakshatras SET name_kn = 'ಉತ್ತರ ಫಲ್ಗುಣಿ'    WHERE id = 'nakshatra-12';
UPDATE public.metadata_nakshatras SET name_kn = 'ಹಸ್ತ'              WHERE id = 'nakshatra-13';
UPDATE public.metadata_nakshatras SET name_kn = 'ಚಿತ್ತಾ'            WHERE id = 'nakshatra-14';
UPDATE public.metadata_nakshatras SET name_kn = 'ಸ್ವಾತಿ'            WHERE id = 'nakshatra-15';
UPDATE public.metadata_nakshatras SET name_kn = 'ವಿಶಾಖಾ'            WHERE id = 'nakshatra-16';
UPDATE public.metadata_nakshatras SET name_kn = 'ಅನುರಾಧಾ'           WHERE id = 'nakshatra-17';
UPDATE public.metadata_nakshatras SET name_kn = 'ಜ್ಯೇಷ್ಠಾ'           WHERE id = 'nakshatra-18';
UPDATE public.metadata_nakshatras SET name_kn = 'ಮೂಲ'               WHERE id = 'nakshatra-19';
UPDATE public.metadata_nakshatras SET name_kn = 'ಪೂರ್ವಾಷಾಢ'        WHERE id = 'nakshatra-20';
UPDATE public.metadata_nakshatras SET name_kn = 'ಉತ್ತರಾಷಾಢ'        WHERE id = 'nakshatra-21';
UPDATE public.metadata_nakshatras SET name_kn = 'ಶ್ರವಣ'             WHERE id = 'nakshatra-22';
UPDATE public.metadata_nakshatras SET name_kn = 'ಧನಿಷ್ಠಾ'           WHERE id = 'nakshatra-23';
UPDATE public.metadata_nakshatras SET name_kn = 'ಶತಭಿಷಾ'            WHERE id = 'nakshatra-24';
UPDATE public.metadata_nakshatras SET name_kn = 'ಪೂರ್ವಭಾದ್ರಪದ'     WHERE id = 'nakshatra-25';
UPDATE public.metadata_nakshatras SET name_kn = 'ಉತ್ತರಭಾದ್ರಪದ'     WHERE id = 'nakshatra-26';
UPDATE public.metadata_nakshatras SET name_kn = 'ರೇವತಿ'             WHERE id = 'nakshatra-27';

-- ── metadata_seva_categories ──────────────────────────────────────────────────
UPDATE public.metadata_seva_categories SET name_kn = 'ನಿತ್ಯ ಸೇವೆ'   WHERE id = 'category-01';
UPDATE public.metadata_seva_categories SET name_kn = 'ಪುರಾಣ ಸೇವೆ'  WHERE id = 'category-02';
UPDATE public.metadata_seva_categories SET name_kn = 'ಹೋಮ'          WHERE id = 'category-03';
UPDATE public.metadata_seva_categories SET name_kn = 'ಶಾಂತಿ ಹೋಮ'   WHERE id = 'category-04';

-- ── sevas ─────────────────────────────────────────────────────────────────────
UPDATE public.sevas SET name_kn = 'ಸರ್ವ ಸೇವೆ'                              WHERE id = 'seva-001';
UPDATE public.sevas SET name_kn = 'ಕನಕಾಭಿಷೇಕ'                              WHERE id = 'seva-002';
UPDATE public.sevas SET name_kn = 'ಮಹಾ ಪೂಜೆ'                               WHERE id = 'seva-003';
UPDATE public.sevas SET name_kn = 'ರಾತ್ರಿ ಪೂಜೆ'                            WHERE id = 'seva-004';
UPDATE public.sevas SET name_kn = 'ಅಲಂಕಾರ'                                 WHERE id = 'seva-005';
UPDATE public.sevas SET name_kn = 'ಪಂಚಾಮೃತ'                                WHERE id = 'seva-006';
UPDATE public.sevas SET name_kn = 'ಕೃಷ್ಣಾಷ್ಟೋತ್ತರ ಅರ್ಚನೆ'                 WHERE id = 'seva-007';
UPDATE public.sevas SET name_kn = 'ತೊಟ್ಟಿಲು ಪೂಜೆ'                          WHERE id = 'seva-008';
UPDATE public.sevas SET name_kn = 'ವಾಯುಸ್ತುತಿ ಪುನಶ್ಚರಣ'                   WHERE id = 'seva-009';
UPDATE public.sevas SET name_kn = 'ಮನ್ಯುಸೂಕ್ತ ಪುನಶ್ಚರಣ'                   WHERE id = 'seva-010';
UPDATE public.sevas SET name_kn = 'ಹಸ್ತೋದಕ'                                WHERE id = 'seva-011';
UPDATE public.sevas SET name_kn = 'ಶ್ರಾದ್ಧ (ಪಿಂಡಪ್ರದಾನ)'                  WHERE id = 'seva-012';
UPDATE public.sevas SET name_kn = 'ಶ್ರಾದ್ಧ (ಸಂಕಲ್ಪ)'                       WHERE id = 'seva-013';
UPDATE public.sevas SET name_kn = 'ಶ್ರಾದ್ಧ ಮಹಾಲಯ'                          WHERE id = 'seva-014';
UPDATE public.sevas SET name_kn = 'ಶ್ರಾದ್ಧ (ಮಹಾಲಯ) ಸಂಕಲ್ಪ'                WHERE id = 'seva-015';
UPDATE public.sevas SET name_kn = 'ಸಾಮೂಹಿಕ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ (೧ ತಿಂಗಳು)'  WHERE id = 'seva-016';
UPDATE public.sevas SET name_kn = 'ಸಾಮೂಹಿಕ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ (೧ ವರ್ಷ)'   WHERE id = 'seva-017';
UPDATE public.sevas SET name_kn = 'ಭಾಗವತ ಪುರಾಣ'                            WHERE id = 'seva-018';
UPDATE public.sevas SET name_kn = 'ರಾಮಾಯಣ ಪುರಾಣ'                           WHERE id = 'seva-019';
UPDATE public.sevas SET name_kn = 'ಪ್ರೋಷ್ಠಪದಿ'                              WHERE id = 'seva-020';
UPDATE public.sevas SET name_kn = 'ವೆಂಕಟೇಶ ಮಹಾತ್ಮೆ'                        WHERE id = 'seva-021';
UPDATE public.sevas SET name_kn = 'ಅಧಿಕ ಮಾಸ ಮಹಾತ್ಮೆ'                       WHERE id = 'seva-022';
UPDATE public.sevas SET name_kn = 'ಪಾವಮಾನ ಹೋಮ'                             WHERE id = 'seva-023';
UPDATE public.sevas SET name_kn = 'ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಹೋಮ'                   WHERE id = 'seva-024';
UPDATE public.sevas SET name_kn = 'ಬಾಲ ಗಣಪತಿ ಹೋಮ'                          WHERE id = 'seva-025';
UPDATE public.sevas SET name_kn = 'ಗಣ ಹೋಮ'                                  WHERE id = 'seva-026';
UPDATE public.sevas SET name_kn = 'ಪುರುಷಸೂಕ್ತ ಹೋಮ'                         WHERE id = 'seva-027';
UPDATE public.sevas SET name_kn = 'ಶ್ರೀಸೂಕ್ತ ಹೋಮ'                           WHERE id = 'seva-028';
UPDATE public.sevas SET name_kn = 'ಮನ್ಯುಸೂಕ್ತ ಹೋಮ'                          WHERE id = 'seva-029';
UPDATE public.sevas SET name_kn = 'ವಾಯುಸ್ತುತಿ ಪುನಶ್ಚರಣ ಹೋಮ'               WHERE id = 'seva-030';
UPDATE public.sevas SET name_kn = 'ಲಕ್ಷ್ಮಿ ಹೃದಯ ಹೋಮ'                       WHERE id = 'seva-031';
UPDATE public.sevas SET name_kn = 'ಆಯುಷ್ಯ ಹೋಮ'                             WHERE id = 'seva-032';
UPDATE public.sevas SET name_kn = 'ಮೃತ್ಯುಂಜಯ ಹೋಮ'                          WHERE id = 'seva-033';
UPDATE public.sevas SET name_kn = 'ಧನ್ವಂತರಿ ಹೋಮ'                           WHERE id = 'seva-034';
UPDATE public.sevas SET name_kn = 'ನವಗ್ರಹ ಶಾಂತಿ'                            WHERE id = 'seva-035';
UPDATE public.sevas SET name_kn = '೬೦ನೇ ಶಾಂತಿ'                             WHERE id = 'seva-036';
UPDATE public.sevas SET name_kn = '೭೦ನೇ ಶಾಂತಿ'                             WHERE id = 'seva-037';
UPDATE public.sevas SET name_kn = '೮೦ನೇ ಶಾಂತಿ'                             WHERE id = 'seva-038';
UPDATE public.sevas SET name_kn = 'ಸಹಸ್ರ ಚಂದ್ರ ದರ್ಶನ ಶಾಂತಿ'               WHERE id = 'seva-039';
UPDATE public.sevas SET name_kn = 'ಸಂಧಿ ಶಾಂತಿ'                             WHERE id = 'seva-040';
UPDATE public.sevas SET name_kn = 'ಕುಜ ಶಾಂತಿ'                              WHERE id = 'seva-041';
UPDATE public.sevas SET name_kn = 'ರಾಹು ಶಾಂತಿ'                             WHERE id = 'seva-042';
UPDATE public.sevas SET name_kn = 'ಶನಿ ಶಾಂತಿ'                              WHERE id = 'seva-043';
UPDATE public.sevas SET name_kn = 'ಗುರು ಶಾಂತಿ'                             WHERE id = 'seva-044';
UPDATE public.sevas SET name_kn = 'ಕೇತು ಶಾಂತಿ'                             WHERE id = 'seva-045';
UPDATE public.sevas SET name_kn = 'ಚಂದ್ರ ಶಾಂತಿ'                            WHERE id = 'seva-046';
UPDATE public.sevas SET name_kn = 'ಸೋಮ ಶಾಂತಿ'                              WHERE id = 'seva-047';
UPDATE public.sevas SET name_kn = 'ಬುಧ ಶಾಂತಿ'                              WHERE id = 'seva-048';
UPDATE public.sevas SET name_kn = 'ಶುಕ್ರ ಶಾಂತಿ'                            WHERE id = 'seva-049';
UPDATE public.sevas SET name_kn = 'ಗ್ರಹಣ ಶಾಂತಿ'                            WHERE id = 'seva-050';
UPDATE public.sevas SET name_kn = 'ಸೀಮಂತ'                                  WHERE id = 'seva-051';
UPDATE public.sevas SET name_kn = 'ನಾಮಕರಣ'                                 WHERE id = 'seva-052';
UPDATE public.sevas SET name_kn = 'ಚೌಲ'                                    WHERE id = 'seva-053';
UPDATE public.sevas SET name_kn = 'ಉಪನಯನ'                                  WHERE id = 'seva-054';
UPDATE public.sevas SET name_kn = 'ಸಮಾವರ್ತನ'                               WHERE id = 'seva-055';
UPDATE public.sevas SET name_kn = 'ಅನ್ನಪ್ರಾಶನ'                             WHERE id = 'seva-056';
UPDATE public.sevas SET name_kn = 'ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ಪ್ರತ್ಯೇಕ'             WHERE id = 'seva-057';
UPDATE public.sevas SET name_kn = 'ನೂತನ ವಸ್ತ್ರ ಸಮರ್ಪಣೆ'                   WHERE id = 'seva-058';
UPDATE public.sevas SET name_kn = 'ವಿಶೇಷ ಫಲ ಪಂಚಾಮೃತ ಅಭಿಷೇಕ'              WHERE id = 'seva-059';
UPDATE public.sevas SET name_kn = 'ಪುಷ್ಪಾಲಂಕಾರ ಸೇವೆ'                       WHERE id = 'seva-060';
UPDATE public.sevas SET name_kn = 'ಮಹಾ ಪೂಜೆ'                               WHERE id = 'seva-061';
UPDATE public.sevas SET name_kn = 'ಸಾಮೂಹಿಕ ಆಶ್ಲೇಷ ಬಲಿ'                    WHERE id = 'seva-062';
UPDATE public.sevas SET name_kn = 'ಬ್ರಹ್ಮಚಾರಿ ಆರಾಧನೆ'                      WHERE id = 'seva-063';
UPDATE public.sevas SET name_kn = 'ಪುಷ್ಪಸಲಂಕಾರ ಸೇವೆ'                       WHERE id = 'seva-064';
UPDATE public.sevas SET name_kn = 'ಹುಗ್ಗಿ ನೈವೇದ್ಯ'                          WHERE id = 'seva-065';
UPDATE public.sevas SET name_kn = 'ಹಸ್ತೋದಕ'                                WHERE id = 'seva-066';
UPDATE public.sevas SET name_kn = 'ಆರಾಧನಾ ಸರ್ವ ಸೇವೆ'                       WHERE id = 'seva-067';
UPDATE public.sevas SET name_kn = 'ಅನ್ನಸಂತರ್ಪಣೆ'                           WHERE id = 'seva-068';
UPDATE public.sevas SET name_kn = 'ರಥೋತ್ಸವ ಸೇವೆ'                           WHERE id = 'seva-069';

COMMIT;
