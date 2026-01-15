import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { getRuleIdFromClassName, getTajweedColor } from '../../utils/tajweedUtils';

/**
 * TajweedText Component
 * Displays Quranic text with Tajweed rules highlighted in different colors
 * Can filter to show only specific rules
 */
const TajweedText = ({ text, showColors = true, filterRuleId = null, style }) => {
  const segments = parseAndColorTajweed(text, showColors, filterRuleId);

  return (
    <Text style={[styles.container, style]}>
      {segments.map((segment, index) => (
        <Text
          key={`seg-${index}`}
          style={[
            styles.segment,
            segment.color && {
              backgroundColor: segment.color,
              paddingHorizontal: 2,
              paddingVertical: 1,
              borderRadius: 3,
            },
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
};

/**
 * Parse HTML text and extract Tajweed segments with colors
 * With detailed logging to debug issues
 */
const parseAndColorTajweed = (html, showColors, filterRuleId) => {
  if (!html) return [{ text: '', color: null }];
  
  const segments = [];
  const pattern = /<tajweed\s+class=([^\s>]+)>([^<]+)<\/tajweed>/gi;
  
  let lastIndex = 0;
  let match;
  let foundAny = false;
  
  // Track all unique class names found
  const classNamesFound = new Set();
  
  while ((match = pattern.exec(html)) !== null) {
    foundAny = true;
    
    // Add plain text before this tag
    if (match.index > lastIndex) {
      const plainText = cleanText(html.substring(lastIndex, match.index));
      if (plainText) {
        segments.push({ text: plainText, color: null });
      }
    }
    
    const className = match[1];
    const taggedText = match[2];
    
    // Track this class name
    classNamesFound.add(className);
    
    const ruleId = getRuleIdFromClassName(className);
    
    // Determine if this segment should be colored
    let color = null;
    if (showColors) {
      if (!filterRuleId || ruleId === filterRuleId) {
        color = getTajweedColor(className);
        
        // DETAILED LOGGING FOR DEBUGGING
        if (filterRuleId && ruleId === filterRuleId) {
          console.log(`🎯 FILTER MATCH: class="${className}" ruleId="${ruleId}" color="${color}"`);
        }
        if (filterRuleId === 'izhar' && ruleId === 'izhar') {
          console.log(`✅ IZHAR FOUND: class="${className}" color="${color}"`);
        }
        if (!color && ruleId) {
          console.log(`⚠️ NO COLOR: class="${className}" ruleId="${ruleId}"`);
        }
      }
    }
    
    const cleaned = cleanText(taggedText);
    if (cleaned) {
      segments.push({ text: cleaned, color, className, ruleId });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < html.length) {
    const remaining = cleanText(html.substring(lastIndex));
    if (remaining) {
      segments.push({ text: remaining, color: null });
    }
  }
  
  // Log all class names found in this verse
  if (filterRuleId && classNamesFound.size > 0) {
    console.log(`📋 All classes in verse: ${Array.from(classNamesFound).join(', ')}`);
  }
  
  if (!foundAny) {
    return [{ text: cleanText(html), color: null }];
  }
  
  return segments;
};

/**
 * Clean HTML entities and remove tags
 */
const cleanText = (str) => {
  if (!str) return '';
  let cleaned = str;
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  cleaned = cleaned.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(parseInt(d, 10)));
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

/**
 * Styles for Tajweed text display
 */
const styles = StyleSheet.create({
  container: {
    fontSize: 30,
    lineHeight: 52,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  segment: {
    fontSize: 30,
    lineHeight: 52,
  },
});

export default TajweedText;