import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../store/app.reducer';
import * as UserActions from '../user/store/user.actions';
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
  today = new Date().getTime();
  isLoading = false;
  isLoadingLikes = false;
  lastPost: boolean;
  viewLikesPost: Post = null; // the post the user want to see likes of

  @ViewChild('main') main: ElementRef;
  @ViewChild('likes') likes: ElementRef;

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
          this.messages = [...res['messages']];
        }
    } catch (error) {
      this.messages =
        ['There was a problem liking the post, please refresh your page and try again.'];
    }
    });
  }

  getPostDateTime = (date: Date) => {
    return date.getFullYear().toString() + '-' + date.getMonth().toString() + '-' + date.getDate();
  }

  getPostDate = (date: Date) => {
    let time = (this.today - date.getTime()) / 1000 / 60;
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

  onSubmit(form: NgForm) {
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
        this.today = new Date().getTime();
        if (res['type'] !== 'success') {
          this.messages.push(...res['messages']);
        } else {
          res['post'].createdAt = new Date(res['post'].createdAt);
          res['post'].updatedAt = new Date(res['post'].updatedAt);
          res['post'].author = this.user;
          this.posts.unshift(res['post'])
        }
      },
      errorMessages => {
        this.messages.push(...errorMessages);
      }
    );

  }

  getFullName(user: { _id: string; email?: string; name?: string; firstName?: string; lastName?: string; }) {
    if (user._id === this.user._id) {
      return 'Me';
    }
    if (user['name']) {
      return user['name'];
    } else if (user['firstName'] || user['lastName']) {
      return ((user['firstName'] || '') + ' ' + (user['lastName'] || '')).trim();
    }
    return user.email;
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

  private getLikesNextPage() {
    return !this.viewLikesPost.likes.users.length ? 1 : Math.floor(this.viewLikesPost.likes.users.length / environment.docsPerPage) + 1;
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
              page: this.getLikesNextPage().toString(),
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
              this.viewLikesPost.likes.users.splice((this.getLikesNextPage() - 1) * environment.docsPerPage);
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

  onScrollLikes(event) {
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
