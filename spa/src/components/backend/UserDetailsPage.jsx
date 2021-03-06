// @flow

import React from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import type { Dispatch } from 'redux';

import Loading from '../Loading';
import Error from '../Error';
import UserUpdatingForm from './UserUpdatingForm';
import withErrorIfWrongRole from '../withErrorIfWrongRole';
import { ROLE_SUPER_ADMIN } from '../../constants/userConstants';
import userActionCreators from '../../actions/userActionCreators';
import { getValueAlias } from '../../utils/userHelper';

import type { UserState, RootState } from '../../reducers/reducerTypes.js.flow';
import type { UserActionCreators } from '../../actions/actionCreatorTypes.js.flow';

type Router = {| +match: Object |};

type MappedState = {| +user: UserState |};

type MappedDispatch = {| +userMethods: UserActionCreators |};

type Props = Router & MappedState & MappedDispatch;

type State = {|
  isLoaded: boolean,
  attributes: {
    +id?: number,
    +email?: string,
    +role?: number,
    +status?: number,
    +createdAt?: Date,
    +updatedAt?: Date | null,
    +lastLoginAt?: Date | null,
  },
  error: string | null,
  isDeletionButtonDisabled: boolean,
|};

class UserDetailsPage extends React.Component<Props, State> {
  state = { isLoaded: false, attributes: {}, error: null, isDeletionButtonDisabled: false };

  componentDidMount(): void {
    this.props.userMethods.viewOne(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.user.details.updatedAt !== this.props.user.details.updatedAt) {
      const message = nextProps.user.details.message;
      if (message !== null) {
        this.setState({ isLoaded: true, error: message });
        return;
      }
      const attributes = nextProps.user.details.attributes;
      if (Object.keys(attributes).length > 0) {
        this.setState({ isLoaded: true, attributes });
      }
    }
  }

  handleDeletion = (): void => {
    if (window.confirm('Are you sure?')) {
      this.props.userMethods.backendDestroy(this.props.match.params.id);
      this.setState({ isDeletionButtonDisabled: true });
    }
  }

  render(): React$Node {
    if (this.state.isLoaded) {
      const error = this.state.error;
      if (error !== null) {
        return <Error message={error} />;
      }

      const attributes = this.state.attributes;
      let updatedAt = '(not set)';
      if (attributes.updatedAt) {
        updatedAt = moment(attributes.updatedAt).format('LLL');
      }
      let lastLoginAt = '(not set)';
      if (attributes.lastLoginAt) {
        lastLoginAt = moment(attributes.lastLoginAt).format('LLL');
      }
      return (
        <main>
          <h1 className="mb-4">{attributes.email}</h1>

          <h2 className="mb-4">Details</h2>
          <div>ID: {attributes.id}</div>
          <div>Email: {attributes.email}</div>
          <div>Role: {getValueAlias('role', attributes.role)}</div>
          <div>Status: {getValueAlias('status', attributes.status)}</div>
          <div>Created at: {moment(attributes.createdAt).format('LLL')}</div>
          <div>Updated at: {updatedAt}</div>
          <div>Last login at: {lastLoginAt}</div>

          <h2 className="mt-4 mb-4">Update</h2>
          <UserUpdatingForm />

          <h2 className="mt-4 mb-4">Delete</h2>
          <button
            className="btn btn-danger"
            onClick={this.handleDeletion}
            disabled={this.state.isDeletionButtonDisabled}
          >Confirm deletion</button>
        </main>
      );
    }

    return <Loading />;
  }
}

function mapStateToProps(state: RootState): MappedState {
  return { user: state.user };
}

function mapDispatchToProps(dispatch: Dispatch<*>): MappedDispatch {
  return { userMethods: bindActionCreators(userActionCreators, dispatch) };
}

export default withErrorIfWrongRole(withRouter(
  connect(mapStateToProps, mapDispatchToProps)(UserDetailsPage),
), [ROLE_SUPER_ADMIN]);
