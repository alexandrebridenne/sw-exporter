const { ipcRenderer, remote } = require('electron');
const dialog = remote.dialog;
const plugins = remote.getGlobal('plugins');
let config = remote.getGlobal('config');


import React from 'react';

import { Button, Grid, Header, Form, Input, Segment, Checkbox } from 'semantic-ui-react';

class Settings extends React.Component {
  constructor() {
    super();
    this.state = {
      'filesPath': config.App.filesPath,
      'showDebug': config.App.debug
    };
  }

  openDialog() {
    self = this;
    dialog.showOpenDialog({ 
      properties: [ 'openDirectory' ] }, function (dirName) {
        if (dirName) {
          self.setState({ 'filesPath': dirName.toString()  });
          config.App.filesPath = dirName.toString();
          ipcRenderer.send('updateConfig');
        }
      }
    );
  }

  toggleDebug(e, element) {
    config.App.debug = element.checked;
    this.setState({'showDebug': element.checked});
    ipcRenderer.send('updateConfig');
  }

  render () {
    const pluginSettings = plugins.map((plugin, i) => {
      return <Grid.Column key={i}>
        <Header as='h5'>{plugin.pluginName}</Header>
        <SettingsGenerator pluginConfig={config.Plugins[plugin.pluginName]} />
      </Grid.Column>
    });
    return (
      <div>
        <Header as='h1'>Settings</Header>
        <Header as='h4' attached='top'>
          App
        </Header>
        <Segment attached>
          <Form>
            <Form.Field>
              <Input label='Files Path' action={<Button content='Change' onClick={this.openDialog.bind(this)} />} value={this.state.filesPath} readOnly fluid />
            </Form.Field>
            <Form.Field>
              <Checkbox label='Show Debug Messages' defaultChecked={this.state.showDebug} onChange={this.toggleDebug.bind(this)}/>
            </Form.Field>
          </Form>
        </Segment>
        <Header as='h4' attached='top'>
          Plugins
        </Header>
        <Segment attached>
          <Grid divided columns={2}>{pluginSettings}</Grid>
        </Segment>
      </div>
    )
  }
}

module.exports = Settings;

class SettingsGenerator extends React.Component {
  changeSetting(e, element) {
    this.props.pluginConfig[element['label']] = element.checked;
    ipcRenderer.send('updateConfig');
  }

  render () {
    const pluginConfig = Object.keys(this.props.pluginConfig).map((key, i) => {
      return <Checkbox key={i} label={key} defaultChecked={this.props.pluginConfig[key]} onChange={this.changeSetting.bind(this)}/>;
    });
    return (
      <div className="setting">
        {pluginConfig}
      </div>
    )
  }
}