import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  Radio,
  HTMLSelect,
  Button,
  ButtonGroup,
  Slider,
} from '@blueprintjs/core';
import FileSelector from '../FileSelector';
import ColorPicker from '../ColorPicker';
import Preview from '../Preview';
import { fileFilters } from '../../constants';
import './DisplayCard.scss';
const { ipcRenderer } = window.require('electron');

const BG = {
  FILE: 'file',
  COLOR: 'color',
};

const DEFAULT_BG_COLOR = '#CCC'; // gray

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => ({
  value: n,
  label: `${n}pt`,
}));

@inject('store')
@observer
class DisplayCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fonts: [],
      backgroundOption: props.store.background.color ? BG.COLOR : BG.FILE,
    };
    ipcRenderer.on('did-finish-getfonts', (event, fonts) => {
      if (Array.isArray(fonts)) {
        this.setState({
          fonts: fonts.map(fontName => ({
            value: fontName,
            lael: fontName,
          })),
        });
      } else {
        console.warn('No fonts for selection', fonts);
      }
    });
    ipcRenderer.send('did-start-getfonts');
  }

  setBackgroundOption = backgroundOption => {
    this.setState({ backgroundOption }, () => {
      this.props.store.setBackground({
        color: backgroundOption === BG.COLOR ? DEFAULT_BG_COLOR : '',
        file: '',
      });
    });
  };

  onBackgroundColorPickerChange = color => {
    this.props.store.setBackground({ file: '', color: color.hex });
  };

  onBackgroundFileSelected = file => {
    this.props.store.setBackground({ file, color: '' });
  };

  onSetFontFamily = evt => {
    this.props.store.setTextProps({ fontFamily: evt.currentTarget.value });
  };

  onSetFontSize = evt => {
    this.props.store.setTextProps({ fontSize: evt.currentTarget.value });
  };

  onTextColorPickerChange = color => {
    this.props.store.setTextProps({ color: color.hex });
  };

  onHighlightColorPickerChange = color => {
    this.props.store.setTextProps({ highlightColor: color.hex , highlightRGB: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+",1)" });
    console.log(this.props);
  };

  toggleBold = () => {
    this.props.store.setTextProps({ bold: !this.props.store.text.bold });
  };

  toggleItalic = () => {
    this.props.store.setTextProps({ italic: !this.props.store.text.italic });
  };

  onSpeechBubbleColorPickerChange = color => {
      console.log(color);
    this.props.store.setSpeechBubbleProps({ color: color.hex, rgba: "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+",1)" });
  };

  onSetSpeechBubbleOpacity = opacity => {
    this.props.store.setSpeechBubbleProps({ opacity });
  };

  render() {
    const {
      store: { background, text, speechBubble, verses },
    } = this.props;
    const { backgroundOption, fonts } = this.state;
    const previewProps = {
      verses,
      background,
      speechBubble,
      text,
    };

    return (
      <div className='display-card'>
        <div className='card__option'>
          <div className='card__option-label display-card__bg-label'>Background:</div>
          <div>
            <div className='card--inline card--bspace'>
              <Radio
                className='display-card__bg-radio'
                label='Image'
                checked={backgroundOption === BG.FILE}
                onChange={() => {
                  this.setBackgroundOption(BG.FILE);
                }}
              />
              <FileSelector
                disabled={backgroundOption !== BG.FILE}
                file={background.file}
                options={{
                  title: 'Select Background File',
                  filters: fileFilters.background,
                  properties: ['openFile'],
                }}
                onFileSelected={this.onBackgroundFileSelected}
              />
            </div>
            <div className='card--inline card--bspace'>
              <Radio
                className='display-card__bg-radio'
                label='Solid color'
                checked={backgroundOption === BG.COLOR}
                onChange={() => {
                  this.setBackgroundOption(BG.COLOR);
                }}
              />
              <ColorPicker
                disabled={backgroundOption !== BG.COLOR}
                value={background.color}
                onChange={this.onBackgroundColorPickerChange}
              />
            </div>
          </div>
        </div>
        <div className='card__option'>
          <div className='card__option-label'>Font:</div>
          <div className='card--inline'>
            <HTMLSelect
              value={text.fontFamily}
              onChange={this.onSetFontFamily}
              options={fonts}
            />
            <HTMLSelect
              value={text.fontSize}
              onChange={this.onSetFontSize}
              options={FONT_SIZES}
            />
            <ColorPicker
              value={text.color}
              onChange={this.onTextColorPickerChange}
            />
            <ButtonGroup>
              <Button
                className='display-card__btn-bold'
                active={text.bold}
                text='B'
                onClick={this.toggleBold}
              />
              <Button
                className='display-card__btn-italic'
                active={text.italic}
                text='i'
                onClick={this.toggleItalic}
              />
            </ButtonGroup>
            <div>Highlight:</div>
            <ColorPicker
              value={text.highlightColor}
              onChange={this.onHighlightColorPickerChange}
            />
          </div>
        </div>
        <div className='card__option'>
          <div className='card__option-label'>Speech bubble:</div>
          <div className='card--inline'>
            <ColorPicker
              value={speechBubble.color}
              onChange={this.onSpeechBubbleColorPickerChange}
            />
            <div>Opacity:</div>
            <Slider
              className='display-card__slider'
              value={speechBubble.opacity}
              min={0}
              max={1}
              stepSize={0.05}
              onChange={this.onSetSpeechBubbleOpacity}
            />
          </div>
        </div>
        <div className='preview__wrapper'>
          <Preview {...previewProps} />
        </div>
      </div>
    );
  }
}

export default DisplayCard;
