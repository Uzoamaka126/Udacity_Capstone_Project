import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createJoke, deleteJoke, getJokes, patchJoke } from '../api/jokes-api'
import Auth from '../auth/Auth'
import { Joke } from '../types/Joke'

interface JokesProps {
  auth: Auth;
  history: History;
}

interface JokesState {
  jokes: Joke[];
  newJokeName: string;
  description: string;
  loadingJokes: boolean
}

export class Jokes extends React.PureComponent<JokesProps, JokesState> {
  state: JokesState = {
    jokes: [],
    newJokeName: '',
    description: '',
    loadingJokes: true,
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newJokeName: event.target.value })
  }

  onEditButtonClick = (jokeId: string) => {
    this.props.history.push(`/jokes/${jokeId}/edit`)
  }

  onJokeCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newJoke = await createJoke(this.props.auth.getIdToken(), {
        name: this.state.newJokeName,
        description: this.state.description
      })
      this.setState({
        jokes: [...this.state.jokes, newJoke],
        newJokeName: '',
        description: ''
      })
    } catch {
      alert('Joke creation failed')
    }
  }

  onJokeDelete = async (jokeId: string) => {
    try {
      await deleteJoke(this.props.auth.getIdToken(), jokeId)
      this.setState({
        jokes: this.state.jokes.filter(joke => joke.jokeId != jokeId)
      })
    } catch {
      alert('Joke deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const jokes = await getJokes(this.props.auth.getIdToken());
      console.log(jokes);
      this.setState({
        jokes,
        loadingJokes: false
      })
    } catch (e) {
      alert(`Failed to fetch jokes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Jokes List</Header>

        {this.renderCreateJokeInput()}

        {this.renderJokes()}
      </div>
    )
  }

  renderCreateJokeInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onJokeCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Let me tell you a joke.."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderJokes() {
    if (this.state.loadingJokes) {
      return this.renderLoading()
    }
    return this.renderJokeList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Jokes...
        </Loader>
      </Grid.Row>
    )
  }

  renderJokeList() {
    return (
      <Grid padded>
        {this.state.jokes && this.state.jokes.map((joke, pos) => {
          return (
            <Grid.Row key={joke.jokeId}>
              <Grid.Column width={10} verticalAlign="middle">
                {joke.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {joke.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(joke.jokeId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onJokeDelete(joke.jokeId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {joke.attachmentUrl && (
                <Image src={joke.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
