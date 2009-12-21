package ConfigAssistant::Init;

use strict;
use ConfigAssistant::Util qw( find_theme_plugin find_option_plugin );

sub plugin {
    return MT->component('ConfigAssistant');
}

sub init_app {
    my $plugin = shift;
    my ($app) = @_;
    return if $app->id eq 'wizard';
    init_options($app);
    my $r = $plugin->registry;
    $r->{tags} = sub { load_tags($app,$plugin) };
}

sub init_options {
#    my $callback = shift;
    my $app = shift;

    # For each plugin, convert options into settings
    my $has_blog_settings = 0;
    my $has_sys_settings = 0;
    
    for my $sig ( keys %MT::Plugins ) {
        my $plugin = $MT::Plugins{$sig};
        my $obj    = $MT::Plugins{$sig}{object};
        my $r      = $obj->{registry};
        my @sets   = keys %{ $r->{'template_sets'} };
        foreach my $set (@sets) {
            if ( $r->{'template_sets'}->{$set}->{'options'} ) {
                foreach my $opt (
                    keys %{ $r->{'template_sets'}->{$set}->{'options'} } )
                {
                    next if ( $opt eq 'fieldsets' );
                    my $option =
                        $r->{'template_sets'}->{$set}->{'options'}->{$opt};

# To avoid option names that may collide with other options in other template sets
# settings are derived by combining the name of the template set and the option's
# key.
                    my $optname = $set . '_' . $opt;
                    if ( _option_exists($sig,$optname) ) {
                        # do nothing
                    }
                    else {
#                        if ( my $default = $option->{default} ) {
#                            if ( !ref($default) && ($default =~ /^\s*sub/ || $default =~ /^\$/)) {
#                                $default = $app->handler_to_coderef($default);
#                                $option->{default} = sub { my $app = MT->instance; return $default->($app) };
#                            }
#                        }
                        if (ref $obj->{'registry'}->{'settings'} eq 'ARRAY') {
                            push @{ $obj->{'registry'}->{'settings'} }, [ $optname, {
                                scope => 'blog',
                                %$option,
                            } ];
                        } else { # (ref $obj->{'registry'}->{'settings'} eq 'HASH') {
                            $obj->{'registry'}->{'settings'}->{$optname} = {
                                scope => 'blog',
                                %$option,
                            };
                        }
                    }
                }
            }
        } # end foreach (@sets)
        # Now register settings for each plugin option, and register a plugin_config_form
        my @options   = keys %{ $r->{'options'} };
        foreach my $opt (@options) {
            next if ( $opt eq 'fieldsets' );
            my $option = $r->{'options'}->{$opt};

            if ($option->{scope} eq 'system') {
                require ConfigAssistant::Plugin;
                $obj->{'registry'}->{'system_config_template'} = \&ConfigAssistant::Plugin::plugin_options;
            }
            if ($option->{scope} eq 'blog') {
                require ConfigAssistant::Plugin;
                $obj->{'registry'}->{'blog_config_template'}   = \&ConfigAssistant::Plugin::plugin_options;
            }

            if ( _option_exists($sig,$opt) ) {
                # do nothing
            }
            else {
                if (ref $obj->{'registry'}->{'settings'} eq 'ARRAY') {
                    push @{ $obj->{'registry'}->{'settings'} }, [ $opt, {
                        %$option,
                    } ];
                } else { # (ref $obj->{'registry'}->{'settings'} eq 'HASH') {
                    $obj->{'registry'}->{'settings'}->{$opt} = {
                        %$option,
                    };
                }
            }
        }
    }
}

sub _option_exists {
    my ($sig, $opt) = @_;
    my $obj    = $MT::Plugins{$sig}{object};
    if (ref $obj->{'registry'}->{'settings'} eq 'ARRAY') {
	my @settings = $obj->{'registry'}->{'settings'}->{$opt};
	foreach (@settings) {
	    return 1 if $opt eq $_[0];
	}
	return 0;
    } elsif (ref $obj->{'registry'}->{'settings'} eq 'HASH') {
	return $obj->{'registry'}->{'settings'}->{$opt} ? 1 : 0;
    }
    return 0;
}

sub uses_config_assistant {
    my $blog = MT->instance->blog;
    return 0 if !$blog;
    my $ts  = MT->instance->blog->template_set;
    return 0 if !$ts;
    my $app = MT::App->instance;
    return 1 if $app->registry('template_sets')->{$ts}->{options};
    return 0;
}

sub load_tags {
    my $app  = shift;
    my $tags = {};

# First load tags that correspond with Plugin Settings
# TODO: this struct needs to be abstracted out to be similar to template set options
    my $cfg  = $app->registry('plugin_config');
    foreach my $plugin_id ( keys %$cfg ) {
        my $plugin_cfg = $cfg->{$plugin_id};
        my $p          = delete $cfg->{$plugin_id}->{'plugin'};
        foreach my $key ( keys %$plugin_cfg ) {
            MT->log({ 
                message => $p->name . " is using a Config Assistant syntax that is no longer supported. plugin_config needs to be updated to 'options'. Please consult documentation.",
                class    => 'system',
                category => 'plugin',
                level    => MT::Log::ERROR(),
            });
        }
    }

    # Now register template tags for each of the template set options.
    for my $sig ( keys %MT::Plugins ) {
        my $plugin = $MT::Plugins{$sig};
        my $obj    = $MT::Plugins{$sig}{object};
        my $r      = $obj->{registry};

        # First initialize all the tags associated with themes
        my @sets   = keys %{ $r->{'template_sets'} };
        foreach my $set (@sets) {
            if ( $r->{'template_sets'}->{$set}->{'options'} ) {
                foreach my $opt (
                    keys %{ $r->{'template_sets'}->{$set}->{'options'} } )
                {
                    my $option =
                        $r->{'template_sets'}->{$set}->{'options'}->{$opt};
                    
                    # If the option does not define a tag name,
                    # then there is no need to register one
                    next if ( !defined( $option->{tag} ) );
                    my $tag = $option->{tag};
                    
                    # TODO - there is the remote possibility that a template set
                    # will attempt to register a duplicate tag. This case needs to be
                    # handled properly. Or does it?
                    # Note: the tag handler takes into consideration the blog_id, the
                    # template set id and the option/setting name.
                    if ( $tag =~ s/\?$// ) {
                        $tags->{block}->{$tag} = sub {
                            my $blog = $_[0]->stash('blog');
                            my $bset = $blog->template_set;
                            $_[0]->stash( 'field',     $bset . '_' . $opt );
                            $_[0]->stash( 'plugin_ns', find_theme_plugin($bset)->id );
                            $_[0]->stash( 'scope',     'blog' );
                            runner( '_hdlr_field_cond',
                                    'ConfigAssistant::Plugin', @_ );
                        };
                    }
                    elsif ( $tag ne '' ) {
                        $tags->{function}->{$tag} = sub {
                            my $blog = $_[0]->stash('blog');
                            my $bset = $blog->template_set;
                            $_[0]->stash( 'field',     $bset . '_' . $opt );
                            $_[0]->stash( 'plugin_ns', find_theme_plugin($bset)->id );
                            $_[0]->stash( 'scope',     'blog' );
                            runner( '_hdlr_field_value',
                                'ConfigAssistant::Plugin', @_ );
                        };
                    }
                }
            }
        }

        my @options   = keys %{ $r->{'options'} };
        foreach my $opt (@options) {
            my $option = $r->{'options'}->{$opt};
                    
            # If the option does not define a tag name,
            # then there is no need to register one
            next if ( !defined( $option->{tag} ) );
            my $tag = $option->{tag};
                    
            # TODO - there is the remote possibility that a template set
            # will attempt to register a duplicate tag. This case needs to be
            # handled properly. Or does it?
            # Note: the tag handler takes into consideration the blog_id, the
            # template set id and the option/setting name.
            if ( $tag =~ s/\?$// ) {
                $tags->{block}->{$tag} = sub {
                    $_[0]->stash( 'field',      $opt );
                    $_[0]->stash( 'plugin_ns',  find_option_plugin($opt)->id );
                    $_[0]->stash( 'scope',      lc($option->{scope}) );
                    runner( '_hdlr_field_cond',
                            'ConfigAssistant::Plugin', @_ );
                };
            }
            elsif ( $tag ne '' ) {
                $tags->{function}->{$tag} = sub {
                    $_[0]->stash( 'field',      $opt );
                    $_[0]->stash( 'plugin_ns',  find_option_plugin($opt)->id );
                    $_[0]->stash( 'scope',      lc($option->{scope}) );
                    runner( '_hdlr_field_value',
                            'ConfigAssistant::Plugin', @_ );
                };
            }
        }
    }

    $tags->{function}{'PluginConfigForm'} =
      '$ConfigAssistant::ConfigAssistant::Plugin::tag_config_form';

    return $tags;
}

sub runner {
    my $method = shift;
    my $class  = shift;
    eval "require $class;";
    if ($@) { die $@; $@ = undef; return 1; }
    my $method_ref = $class->can($method);
    my $plugin     = MT->component("ConfigAssistant");
    return $method_ref->( $plugin, @_ ) if $method_ref;
    die $plugin->translate( "Failed to find [_1]::[_2]", $class, $method );
}

1;

