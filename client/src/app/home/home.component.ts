import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../store/app.reducer';
import { Company } from 'app/company/company.model';
import { Employee } from 'app/employees/employee.model';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { take } from 'rxjs/operators';
import { Post } from './post.model';
import { ChatService } from 'app/chat/chat-socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  posts: Post[];
  messages: string[];
  userSub: Subscription;
  user: Employee | Company;
  kind: string;
  postPage: number;
  nodeServer = environment.nodeServer + 'posts';
  isLoading = false;
  isLoadingLikes = false;
  isLoadingComments = false;
  lastPost: boolean;
  viewLikesPost: Post = null; // the post the user want to see likes of
  commentPostInd: number = null; // the post ind the user want to comment on


  @ViewChild('main') main: ElementRef;
  @ViewChild('likes') likes: ElementRef;
  @ViewChild('comment') comment: ElementRef;

  constructor(private store: Store<fromApp.AppState>,
              private http: HttpClient,
              private chatService: ChatService) { }

  ngOnInit() {
    this.postPage = 1;
    this.messages = [];
    this.posts = [];
    this.userSub = this.store.select('user').subscribe(userState => {
      this.user = userState.user;
      this.kind = userState.kind ? userState.kind.charAt(0).toUpperCase() + userState.kind.substr(1) : null;
    });
    if (this.user) {
      this.isLoading = true;
      this.fetchNextPostsPage(true);
    }

    this.chatService.getMessage('postLiked').subscribe(res => {
      try {
        if (res['type'] === 'success') {
          const post = this.posts.find(pos => pos._id === res['post']._id);
          if (post) {
            post.updatedAt = new Date(res['post'].updatedAt);
            if (res['post'].numLikes < post.likes.total) { // a user unlike the post
              post.likes.users = post.likes.users.filter(user => {
                return user.user._id !== res['post'].userLike;
              });
            }
            post.likes.total = res['post'].numLikes;
          }
        } else {
          if (this.user && res['userLike'] === this.user._id) {
            this.messages = [...res['messages']];
          }
        }
      } catch (error) {
        if (this.user && res['userLike'] === this.user._id) {
          this.messages =
          ['There was a problem liking the post, please refresh your page and try again.'];
        }
      }
    });

    this.chatService.getMessage('commentedPost').subscribe(res => {
      try {
        if (res['type'] === 'success') {
          const post = this.posts.find(pos => pos._id === res['post']._id);
          if (post) {
            post.updatedAt = new Date(res['post'].updatedAt);

            if (this.user && res['post'].commentedUser === this.user._id) {
              res['post'].comment.author = JSON.parse(JSON.stringify(this.user));
              res['post'].comment.createdAt = new Date(res['post'].comment.createdAt);
              res['post'].comment.updatedAt = new Date(res['post'].comment.updatedAt);
              post.comments.comments.push(res['post'].comment);
            }
            post.comments.total = res['post'].numComments;
          }
        } else {
          if (this.user && res['commentedUser'] === this.user._id) {
            this.messages = [...res['messages']];
          }
        }
      } catch (error) {
        if (this.user && res['commentedUser'] === this.user._id) {
          this.messages =
          ['There was a problem commenting the post, please refresh your page and try again.'];
        }
      }
    });
  }

  getPostDateTime = (date: Date) => {
    return date.getFullYear().toString() + '-' + date.getMonth().toString() + '-' + date.getDate();
  }

  getPostDate = (date: Date) => {
    let time = (new Date().getTime() - date.getTime()) / 1000 / 60;
    let quantity = 'min';
    if (time > 60) {
      time /= 60;
      quantity = 'h';
    }
    if (time > 24 && quantity === 'h') {
      time /= 24;
      quantity = 'd';
    }
    if (time > 7 && quantity === 'd') {
      time /= 7;
      quantity = 'w';
    }
    if (time > 4 && quantity === 'w') {
      time /= 4;
      quantity = 'mo';
    }

    return Math.floor(time) ? Math.floor(time).toString() + quantity : 'now';
  }

  onSubmitPost(form: NgForm) {
    if (form.invalid) {
      return this.messages = ['The form is invalid.'];
    }
    this.messages = [];
    const content = form.value.postContent;
    form.reset();
    this.http
      .post(this.nodeServer + '/create', {
        content,
        kind: this.kind,
        authorId: this.user._id
      })
      .pipe(take(1))
      .subscribe(res => {
        if (res['type'] !== 'success') {
          this.messages.push(...res['messages']);
        } else {
          res['post'].createdAt = new Date(res['post'].createdAt);
          res['post'].updatedAt = new Date(res['post'].updatedAt);
          res['post'].author = this.user;
          res['post'].likes = {
            total: 0,
            users: []
          };

          res['post'].comments = {
            total: 0,
            comments: []
          };
          this.posts.unshift(res['post']);
        }
      },
      errorMessages => {
        this.messages.push(...errorMessages);
      }
    );

  }

  getFullName(user: { _id: string; email?: string; name?: string; firstName?: string; lastName?: string; }) {
    let fullName = '';
    if (user['name']) {
      fullName = user['name'];
    } else if (user['firstName'] || user['lastName']) {
      fullName = ((user['firstName'] || '') + ' ' + (user['lastName'] || '')).trim();
    } else {
      fullName = user.email;
    }

    if (user._id === this.user._id) {
      fullName = 'Me (' + fullName + ')';
    }
    return fullName;
  }

  private fetchNextPostsPage(onInit = false) {
    const container = !onInit ? this.main.nativeElement.getBoundingClientRect() : null;
    if (onInit || (!this.messages.length && // won't fetch in case of an error
        !this.isLoading && // won't fetch in a middle of a fetch
        !this.lastPost && // won't fetch if the last employee was fetched
        (container.bottom <= window.innerHeight || // if the whole list is shown - so fetch
        container.height - window.pageYOffset < window.innerHeight))) { // check if scrolled to the container
      this.isLoading = true;
      this.http
        .get(this.nodeServer + '/fetchPosts',
          {
            params: {
              page: this.postPage.toString()
            }
          }
        )
        .pipe(take(1))
        .subscribe(res => {
          this.isLoading = false;
          if (res['type'] === 'success') {
            res['posts'] = res['posts'].map(post => {
              post.createdAt = new Date(post.createdAt);
              post.updatedAt = new Date(post.updatedAt);
              post['likes'] = {
                total: post.numLikes,
                users: []
              };
              post['comments'] = {
                total: post.numComments,
                comments: []
              };

              return post;
            });
            this.posts.push(...res['posts']);
            this.lastPost = res['total'] === this.posts.length;
            this.postPage++;
          } else {
            this.messages.push(...res['messages']);
          }
        },
        errorMessages => {
          this.messages.push(...errorMessages);
        }
      );
    }
  }

  private getLikesCommentsNextPage(list: object[]) {
    return !list.length ? 1 : Math.floor(list.length / environment.docsPerPage) + 1;
  }

  private fetchNextLikesPage() {
    if (this.viewLikesPost && !this.messages.length && // won't fetch in case of an error
        !this.isLoadingLikes && // won't fetch in a middle of a fetch
        this.viewLikesPost.likes.total > this.viewLikesPost.likes.users.length && // won't fetch if the last like was fetched
        this.likes.nativeElement.scrollHeight - this.likes.nativeElement.scrollTop - this.likes.nativeElement.offsetHeight < 300) {
      this.isLoadingLikes = true;
      this.http
        .get(this.nodeServer + '/fetchLikes',
          {
            params: {
              page: this.getLikesCommentsNextPage(this.viewLikesPost.likes.users).toString(),
              postId: this.viewLikesPost._id
            }
          }
        )
        .pipe(take(1))
        .subscribe(res => {
          this.isLoadingLikes = false;
          if (res['type'] === 'success') {
            // check if fetching a page that was previously fetched
            // when the last page wasn't "full" and new users liked the post
            if ( this.viewLikesPost.likes.users.length % environment.docsPerPage !== 0 ) {
              // last page isn't full - we are fetching likes to fill it
              this.viewLikesPost.likes.users.splice(
                (this.getLikesCommentsNextPage(this.viewLikesPost.likes.users) - 1) * environment.docsPerPage);
            }
            res['likes'].forEach(like => {
              this.viewLikesPost.likes.users.push({
                user: like.user,
                onModel: like.onModel
              });
            });

            if (this.likes.nativeElement.children[0].offsetHeight <
                this.likes.nativeElement.offsetHeight) {
              this.fetchNextLikesPage();
            }
          } else {
            this.messages.push(...res['messages']);
          }
        },
        errorMessages => {
          this.messages.push(...errorMessages);
        }
      );
    }
  }

  onScrollLikes() {
    this.fetchNextLikesPage();
  }

  onViewLikes(postInd: number) {
    this.viewLikesPost = this.posts[postInd];
    this.fetchNextLikesPage();
  }

  onLikePost(postId: string) {
    this.chatService.sendMessage('likeAPost', {
      userId: this.user._id,
      kind: this.kind,
      postId
    });
  }

  @HostListener('window:scroll', ['$event']) doSomething(event) {
    this.fetchNextPostsPage();
  }

  onCommentPost(postInd: number) {
    this.commentPostInd = postInd === this.commentPostInd ? null : postInd;
    if (Number.isInteger(this.commentPostInd)) {
      this.showComments(this.commentPostInd);
    }
  }

  showComments(postInd: number) {
    if (!this.isLoadingComments &&
        this.posts[postInd].comments.total > 0 &&
        this.posts[postInd].comments.comments.length === 0) {
      this.fetchNextCommentsPage(postInd);
    }
  }

  onSubmitComment(postId: string) {
    if (this.comment.nativeElement.value.trim() === '') {
      return;
    }
    this.chatService.sendMessage('commentAPost', {
      userId: this.user._id,
      kind: this.kind,
      postId,
      comment: this.comment.nativeElement.value
    });
    this.commentPostInd = null;
  }


  fetchNextCommentsPage(postInd: number) {
    this.commentPostInd = postInd;
    this.isLoadingComments = true;
    this.http
      .get(this.nodeServer + '/fetchComments',
        {
          params: {
            page: this.getLikesCommentsNextPage(this.posts[postInd].comments.comments).toString(),
            postId: this.posts[postInd]._id
          }
        }
      )
      .pipe(take(1))
      .subscribe(res => {
        this.isLoadingComments = false;
        if (res['type'] === 'success') {
          // check if fetching a page that was previously fetched
          // when the last page wasn't "full" and new users commented the post
          if ( this.posts[postInd].comments.comments.length % environment.docsPerPage !== 0 ) {
            // last page isn't full - we are fetching likes to fill it
            this.posts[postInd].comments.comments.splice(
              (this.getLikesCommentsNextPage(this.posts[postInd].comments.comments) - 1) * environment.docsPerPage);
          }
          res['comments'].forEach(comment => {
            comment.createdAt = new Date(comment.createdAt);
            comment.updatedAt = new Date(comment.updatedAt);
            this.posts[postInd].comments.comments.push(comment);
          });
          this.posts[postInd].comments.page++;
        } else {
          this.messages.push(...res['messages']);
        }
      },
      errorMessages => {
        this.messages.push(...errorMessages);
      }
    );
  }

  onClose() {
    this.messages = [];
  }

  onCloseLikes(event) {
    if (event.target.classList.contains('backdrop') ||
        event.target.classList.contains('close-button')) {
      this.viewLikesPost = null;
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    this.onClose();
  }
}
