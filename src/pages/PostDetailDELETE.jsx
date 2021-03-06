import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from 'components/CodeBlock';

import { firebaseConnect, getVal } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { compose } from 'redux';

class PostDetail extends Component {
  render() {
    const allTags = this.props.tags;
    const post = this.props.location.state.post;
    return (
      <div className="page--container resource-detail-page">

        <div className="page">
          {/* TODO: handle multiple images per resource */}
          <div className="resource-detail--image-header">
            {post.images && post.images.map((image, index) => {
              return (
                <img src={image.downloadURL} alt={image.description || ""}/>
              )
            })}
          </div>

          <div className="resource-detail--header">
            <h1>{post.name}</h1>
            <p className="resource-detail--posted-at">May 20 @ 3pm</p>
            <p className="resource-detail--header--snippet">{post.snippet}</p>
          </div>

          <div className="resource-detail--tags">
            { allTags &&
              post.tags.map((key, index) => {
                const tag = allTags[key];
                return (
                  <div className="tag" key={index} style={{backgroundColor: tag.bgColor || "#007aff", color: tag.color || '#FFF'}}>
                   <p>{tag.name}</p>
                  </div>
                )
              })
            }
          </div>
          <div className="resource-detail--content">
            <ReactMarkdown source={post.content} renderers={{ code: CodeBlock }}/>
          </div>
        </div>
      </div>
    )
  }
}

const enhance = compose(
  firebaseConnect(props => {
    return [
      { path: `posts/${props.match.params.id}` },
      'tags'
    ]
  }),
  connect(({ firebase }, props) => ({
    post: getVal(firebase, `data/posts/${props.match.params.id}`),
    tags: firebase.data.tags
  }))
)

export default enhance(PostDetail);
