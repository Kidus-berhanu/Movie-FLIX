
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {OnTVService} from "../../services/onTV.service";
import {IMovie} from "../../interfaces/movie.interface";
import {ITV} from "../../interfaces/tv.interface";
import {IContent} from "../../interfaces/content.interface";
import {MatButtonModule} from "@angular/material/button";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {MovieCardComponent} from "../../../../shared/components/poster-card-view/poster-card.component";
import {MatIconModule} from "@angular/material/icon";
import {ImgMissingDirective} from "../../../../shared/directives/img-missing.directive";
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PaginationModel} from '../../../../core/models/pagination.model';
import {MoviesService} from '../../services/movies.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {SeoService} from '../../../../core/services/seo.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.Item.html',
  styleUrls: ['./movie.Item.scss'],
  imports: [
    MatButtonModule,
    NgForOf,
    NgIf,
    DatePipe,
    MatProgressBarModule,
    CdkDrag,
    MatDialogModule,
    CdkDragHandle,
    MovieCardComponent,
    MatIconModule,
    ImgMissingDirective
  ],
  standalone: true
})
export class MovieItem implements OnInit {

  contentType = '';
  content!: Partial<IMovie | ITV | any>;
  recomendedContentList: Array<PaginationModel> = [];
  video: IContent;
  isLoading = true;

  @ViewChild('matTrailerDialog') matTrailerDialog: TemplateRef<any>;

  constructor(
    private moviesService: MoviesService,
    private tvShowsService: OnTVService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private seo: SeoService,
    public trailerDialog: MatDialog
  ) {
    this.contentType = this.router.url.split('/')[1];
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        const id = params['url'];

        if (this.contentType === 'movies') {
          this.getMovie(id);
          this.getMovieVideo(id);
          this.getRecomendedMovie(id);
        } else {
          this.getTVShow(id);
          this.getTVShowVideo(id);
          this.getRecomendedTVShow(id);
        }

      }
    );
  }

  getMovie(id) {
    this.isLoading = true;

    this.moviesService.getMovie(id).pipe(take(1)).subscribe(
      movie => {
        this.content = movie;
        // this.generateSeo();
        this.isLoading = false
      }
    );
  }

  getMovieVideo(id) {
    this.moviesService.getMovieVideos(id).pipe(take(1)).subscribe(
      res => {
        if (res?.results?.length > 0) {
          const trailerList = res.results.filter(video => video.type === 'Trailer');
          this.video = trailerList[0];
          this.video['url'] = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.video['key']);
        } else {
          this.video = null;
        }
      }, () => {}
    );
  }

  getRecomendedMovie(id) {
    this.moviesService.getRecomendMovies(id).pipe(take(1)).subscribe(
      res => {
        this.recomendedContentList = res.results.slice(0, 12);
      }, () => {}
    );
  }


  getTVShow(id) {
    this.isLoading = true;

    this.tvShowsService.getTVShow(id).pipe(take(1)).subscribe(
      tvShow => {
        this.content = tvShow;
        // this.generateSeo();
        this.isLoading = false
      }
    );
  }

  getTVShowVideo(id) {
    this.tvShowsService.getTVShowVideos(id).pipe(take(1)).subscribe(
      res => {
        if (res?.results?.length > 0) {
          this.video = res.results.filter(video => video.type === 'Trailer')[0];
          this.video['url'] = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.video['key']);
        } else {
          this.video = null;
        }
      }, () => {}
    );
  }

  getRecomendedTVShow(id) {
    this.tvShowsService.getRecomendTVShows(id).pipe(take(1)).subscribe(
      res => {
        this.recomendedContentList = res.results.slice(0, 12);
      }, () => {}
    );
  }


  // generateSeo() {
  //   this.seo.generateTags({
  //     title: `${this.content.title}`,
  //     description: `${this.content.overview}`,
  //     image: `https://image.tmdb.org/t/p/w780/${this.content.backdrop_path}`,
  //     slug: 'movie'
  //   });
  // }

  openDialog(): void {
    const dialogRef = this.trailerDialog.open(this.matTrailerDialog, {});
    dialogRef.disableClose = false;
  }

}
