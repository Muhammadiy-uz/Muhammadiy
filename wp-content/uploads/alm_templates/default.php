<article class="alm-item<?php if (!has_post_thumbnail()) { ?><?php } ?>">
   <?php if ( has_post_thumbnail() ) { the_post_thumbnail('alm-thumbnail'); }?>
   <h3><a href="<?php the_permalink(); ?>" title="<?php the_title(); ?>"><?php the_title(); ?></a></h3>
   <p class="entry-meta"><?php the_time(); ?></p>
   <?php the_excerpt(); ?>
</article>
